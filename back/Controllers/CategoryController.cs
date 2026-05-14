using MatchJob.Data;
using MatchJob.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Controllers;

[ApiController]
[Route("categories")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoryController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List()
    {
        var categories = await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{categoryId:guid}/tags")]
    [AllowAnonymous]
    public async Task<IActionResult> ListTagsByCategory(Guid categoryId)
    {
        var categoryExists = await _db.Categories
            .AsNoTracking()
            .AnyAsync(c => c.Id == categoryId);

        if (!categoryExists)
        {
            return NotFound(new
            {
                message = "Categoria não encontrada."
            });
        }

        var tags = await _db.CategoryTags
            .AsNoTracking()
            .Where(ct => ct.CategoryId == categoryId)
            .Select(ct => new TagResponse
            {
                Id = ct.Tag.Id,
                Name = ct.Tag.Name,
                Slug = ct.Tag.Slug
            })
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(tags);
    }
}