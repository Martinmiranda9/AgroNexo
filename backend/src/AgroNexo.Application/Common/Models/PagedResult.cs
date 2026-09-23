namespace AgroNexo.Application.Common.Models;

/// <summary>
/// Generic paginated response wrapper for API collection endpoints.
/// </summary>
/// <typeparam name="T">Type of items in the page.</typeparam>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedResult(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items ?? Array.Empty<T>();
        TotalCount = totalCount;
        PageNumber = pageNumber < 1 ? 1 : pageNumber;
        PageSize = pageSize < 1 ? 20 : pageSize;
    }

    public static PagedResult<T> Create(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize)
    {
        return new PagedResult<T>(items, totalCount, pageNumber, pageSize);
    }
}
