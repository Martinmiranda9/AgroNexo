using AgroNexo.Application.Farms.DTOs;
using AgroNexo.Domain.Entities;

namespace AgroNexo.Application.Farms.UseCases;

internal static class FarmMemberMapper
{
    /// <param name="includeContact">Solo para el productor dueño del campo.</param>
    public static FarmMemberResponse ToResponse(FarmMember member, Professional professional, bool includeContact) => new()
    {
        Id = member.Id,
        ProfessionalId = professional.Id,
        PublicId = professional.PublicId,
        FirstName = professional.FirstName,
        LastName = professional.LastName,
        Role = professional.Role,
        Specialty = professional.Specialty,
        LicenseNumber = professional.LicenseNumber,
        IsVerified = professional.IsVerified,
        JoinedAt = member.JoinedAt,
        Contact = includeContact
            ? new FarmContactResponse { PhoneNumber = professional.PhoneNumber, Email = professional.Email }
            : null
    };
}
