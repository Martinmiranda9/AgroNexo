using AgroNexo.Domain.Enums;

namespace AgroNexo.Application.Farms.DTOs;

/// <summary>
/// Tablero compartido del campo: lo mismo para el productor dueño y para cada profesional del equipo (los contactos
/// siguen las reglas del espacio de trabajo). Lotes, cultivos y actividades son de la campaña elegida.
/// </summary>
public class FarmDashboardResponse
{
    public WorkspaceResponse Workspace { get; set; } = new();

    /// <summary>Campañas del campo, de la más nueva a la más vieja.</summary>
    public List<CampaignResponse> Campaigns { get; set; } = new();

    /// <summary>Campaña que muestra el tablero: la pedida, la que contiene hoy o la más reciente.</summary>
    public Guid? SelectedCampaignId { get; set; }

    public FarmDashboardKpisResponse Kpis { get; set; } = new();

    /// <summary>Superficie por cultivo en la campaña, de mayor a menor.</summary>
    public List<CropSurfaceResponse> CropSurfaces { get; set; } = new();

    public List<LotResponse> Lots { get; set; } = new();

    /// <summary>
    /// Avance de cada labor sobre la superficie a trabajar de la campaña (lotes con cultivo; si no hay, todos). Siembra y
    /// cosecha van siempre; el resto, si tiene actividades.
    /// </summary>
    public List<LaborProgressResponse> LaborProgress { get; set; } = new();

    public CampaignTimelineResponse? Timeline { get; set; }

    public List<FarmActivityResponse> RecentActivities { get; set; } = new();

    public WeeklySummaryResponse WeeklySummary { get; set; } = new();
}

public class FarmDashboardKpisResponse
{
    public decimal TotalHectares { get; set; }
    public int TeamSize { get; set; }

    /// <summary>Roles distintos en el equipo (agrónomo, contador…).</summary>
    public int TeamRoleCount { get; set; }

    public int LotCount { get; set; }
    public decimal LotHectares { get; set; }

    /// <summary>Cultivos distintos en la campaña.</summary>
    public int CropCount { get; set; }

    /// <summary>Actividades sin finalizar (Inicio o En proceso) de la campaña.</summary>
    public int OpenActivities { get; set; }
}

public class LaborProgressResponse
{
    public FarmActivityType Type { get; set; }
    public decimal HectaresWorked { get; set; }
    public decimal HectaresPlanned { get; set; }

    /// <summary>Avance entre 0 y 1.</summary>
    public decimal Progress { get; set; }
}

public class CropSurfaceResponse
{
    public CropType Crop { get; set; }
    public decimal Hectares { get; set; }
    public int LotCount { get; set; }
}

/// <summary>
/// Línea de la campaña: cuánto avanzó y en qué etapa está cada cultivo.
/// </summary>
public class CampaignTimelineResponse
{
    public Guid CampaignId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly StartsOn { get; set; }
    public DateOnly EndsOn { get; set; }
    public DateOnly Today { get; set; }

    /// <summary>Avance entre 0 y 1.</summary>
    public decimal Progress { get; set; }

    public List<TimelinePlantingResponse> Plantings { get; set; } = new();

    /// <summary>La próxima cosecha prevista desde hoy, si hay alguna cargada.</summary>
    public NextHarvestResponse? NextHarvest { get; set; }
}

public class TimelinePlantingResponse
{
    public Guid LotId { get; set; }
    public string LotName { get; set; } = string.Empty;
    public CropType Crop { get; set; }
    public DateOnly? SowingDate { get; set; }
    public DateOnly? ExpectedHarvestDate { get; set; }
    public CropPhase Phase { get; set; }
}

public class NextHarvestResponse
{
    public string LotName { get; set; } = string.Empty;
    public CropType Crop { get; set; }
    public DateOnly Date { get; set; }
    public int DaysLeft { get; set; }
}

/// <summary>
/// Resumen de los últimos 7 días del campo.
/// </summary>
public class WeeklySummaryResponse
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }

    /// <summary>Actividades registradas en la semana.</summary>
    public int ActivitiesCreated { get; set; }

    /// <summary>Actividades finalizadas en la semana.</summary>
    public int ActivitiesCompleted { get; set; }

    /// <summary>Profesionales que se sumaron al equipo en la semana.</summary>
    public int NewMembers { get; set; }

    /// <summary>Hasta 3 actividades finalizadas en la semana, la más reciente primero.</summary>
    public List<FarmActivityResponse> Highlights { get; set; } = new();
}
