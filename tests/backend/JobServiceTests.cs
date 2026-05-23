using Xunit;
using Moq;
using FluentAssertions;
using MatchJob.Core.Services;
using MatchJob.Core.Interfaces;
using MatchJob.Core.Entities;

namespace MatchJob.Tests.Unit.Services;

/// <summary>
/// Testes unitários do JobService — padrão AAA (Arrange, Act, Assert)
/// </summary>
public class JobServiceTests
{
    private readonly Mock<IJobRepository> _repoMock;
    private readonly JobService _sut;

    public JobServiceTests()
    {
        _repoMock = new Mock<IJobRepository>();
        _sut = new JobService(_repoMock.Object);
    }

    [Fact]
    public async Task CriarVaga_ComDadosValidos_RetornaVagaCriada()
    {
        // Arrange
        var novaVaga = new Job
        {
            Titulo     = "Desenvolvedor .NET Sênior",
            Empresa    = "Empresa XPTO",
            Salario    = 12000m,
            Modalidade = Modalidade.Remoto
        };

        _repoMock
            .Setup(r => r.AddAsync(It.IsAny<Job>()))
            .ReturnsAsync((Job j) => { j.Id = Guid.NewGuid(); return j; });

        // Act
        var resultado = await _sut.CriarVagaAsync(novaVaga);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Id.Should().NotBeEmpty();
        resultado.Titulo.Should().Be(novaVaga.Titulo);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Job>()), Times.Once);
    }

    [Fact]
    public async Task CriarVaga_ComTituloVazio_LancaArgumentException()
    {
        // Arrange
        var vagaInvalida = new Job { Titulo = "", Empresa = "Empresa" };

        // Act
        var ato = () => _sut.CriarVagaAsync(vagaInvalida);

        // Assert
        await ato.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Título*");
    }

    [Theory]
    [InlineData(Modalidade.Remoto)]
    [InlineData(Modalidade.Presencial)]
    [InlineData(Modalidade.Hibrido)]
    public async Task BuscarVagas_PorModalidade_RetornaSomenteVagasCorretas(
        Modalidade modalidade)
    {
        // Arrange
        var vagasFake = new List<Job>
        {
            new() { Id = Guid.NewGuid(), Titulo = "Dev .NET",   Modalidade = modalidade },
            new() { Id = Guid.NewGuid(), Titulo = "Dev React",  Modalidade = modalidade }
        };

        _repoMock
            .Setup(r => r.GetByModalidadeAsync(modalidade))
            .ReturnsAsync(vagasFake);

        // Act
        var resultado = await _sut.BuscarPorModalidadeAsync(modalidade);

        // Assert
        resultado.Should().HaveCount(2);
        resultado.Should().OnlyContain(v => v.Modalidade == modalidade);
    }

    [Fact]
    public async Task ExcluirVaga_QuandoNaoExiste_LancaNotFoundException()
    {
        // Arrange
        var idInexistente = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(idInexistente)).ReturnsAsync((Job?)null);

        // Act
        var ato = () => _sut.ExcluirVagaAsync(idInexistente);

        // Assert
        await ato.Should().ThrowAsync<KeyNotFoundException>();
    }
}
