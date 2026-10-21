using AgroNexo.Domain.Entities;
using AgroNexo.Domain.Exceptions;
using FluentAssertions;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using Xunit;

namespace AgroNexo.UnitTests;

/// <summary>
/// Lotes y campos dibujados en el mapa: el dibujo solo los ubica; las hectáreas son siempre las declaradas.
/// </summary>
public class LotBoundaryDomainTests
{
    private static readonly GeometryFactory Factory = NtsGeometryServices.Instance.CreateGeometryFactory(Lot.BoundarySrid);

    /// <summary>Rectángulo entre dos latitudes y dos longitudes, en sentido horario desde el noroeste.</summary>
    private static Polygon Box(double south, double west, double north, double east) => Factory.CreatePolygon(new[]
    {
        new Coordinate(west, north), new Coordinate(east, north), new Coordinate(east, south),
        new Coordinate(west, south), new Coordinate(west, north)
    });

    /// <summary>Unas 66 ha cerca de Pergamino.</summary>
    private static Polygon WestLot() => Box(-33.889, -60.599, -33.881, -60.591);

    private static Polygon Bowtie() => Factory.CreatePolygon(new[]
    {
        new Coordinate(-60.598, -33.882), new Coordinate(-60.592, -33.888), new Coordinate(-60.592, -33.882),
        new Coordinate(-60.598, -33.888), new Coordinate(-60.598, -33.882)
    });

    [Fact]
    public void Lot_Drawn_KeepsTheDeclaredHectaresAndRecordsWhoDrewIt()
    {
        var agronomistId = Guid.NewGuid();

        var lot = new Lot(Guid.NewGuid(), "Lote 1", 11m, WestLot(), agronomistId);

        lot.Hectares.Should().Be(11m, "el dibujo mide unas 66 ha, pero manda lo declarado");
        lot.Boundary.Should().NotBeNull();
        lot.CreatedByProfessionalId.Should().Be(agronomistId);
        lot.BoundaryEditedByProfessionalId.Should().Be(agronomistId);
        lot.BoundaryEditedAt.Should().NotBeNull();
    }

    [Fact]
    public void Lot_WithoutDrawing_HasNoShape()
    {
        var lot = new Lot(Guid.NewGuid(), "Lote 1", 20m);

        lot.Boundary.Should().BeNull();
        lot.BoundaryEditedAt.Should().BeNull();
    }

    [Fact]
    public void Lot_WithCrossedBorder_Throws()
    {
        var create = () => new Lot(Guid.NewGuid(), "Lote 1", 20m, Bowtie());

        create.Should().Throw<DomainValidationException>().WithMessage("*se cruza consigo mismo*");
    }

    [Fact]
    public void Lot_UpdatedWithoutDrawing_LosesItsShapeAndKeepsTheNewHectares()
    {
        var lot = new Lot(Guid.NewGuid(), "Lote 1", 20m, WestLot());

        lot.Update("Lote 1", 25m);

        lot.Hectares.Should().Be(25m);
        lot.Boundary.Should().BeNull();
        lot.BoundaryEditedAt.Should().BeNull();
    }

    [Fact]
    public void Lot_UpdatedWithTheSameShape_KeepsTheLastEditor_AndANewShapeSignsTheEditor()
    {
        var shape = WestLot();
        var lot = new Lot(Guid.NewGuid(), "Lote 1", 20m, shape);
        var agronomistId = Guid.NewGuid();

        lot.Update("Lote Uno", 30m, (Polygon)shape.Copy(), agronomistId);
        lot.Name.Should().Be("Lote Uno");
        lot.Hectares.Should().Be(30m);
        lot.BoundaryEditedByProfessionalId.Should().BeNull("la forma no cambió: sigue firmada por el productor");

        lot.Update("Lote Uno", 30m, Box(-33.889, -60.599, -33.880, -60.591), agronomistId);
        lot.BoundaryEditedByProfessionalId.Should().Be(agronomistId);
        lot.Hectares.Should().Be(30m, "corregir el dibujo no cambia las hectáreas declaradas");
    }

    [Fact]
    public void Farm_WithDrawnPerimeter_KeepsTheDeclaredHectares()
    {
        var farm = new Farm(Guid.NewGuid(), Guid.NewGuid(), "La Esperanza", 350, WestLot());

        farm.TotalHectares.Should().Be(350m);
        farm.Location.Should().NotBeNull();
    }

    [Fact]
    public void Farm_WithCrossedPerimeter_Throws()
    {
        var create = () => new Farm(Guid.NewGuid(), Guid.NewGuid(), "La Esperanza", 350, Bowtie());

        create.Should().Throw<DomainValidationException>().WithMessage("*se cruza consigo mismo*");
    }

    [Fact]
    public void Farm_SetPlace_TrimsAndLeavesBlanksEmpty()
    {
        var farm = new Farm(Guid.NewGuid(), Guid.NewGuid(), "La Esperanza", 350);

        farm.SetPlace(" Buenos Aires ", "Pergamino", "  ");

        farm.Province.Should().Be("Buenos Aires");
        farm.Department.Should().Be("Pergamino");
        farm.Locality.Should().BeNull();
    }
}
