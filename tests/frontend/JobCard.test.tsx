import { render, screen, fireEvent } from "@testing-library/react";
import { JobCard } from "@/components/JobCard";
import type { Job } from "@/types/job";

const mockJob: Job = {
  id: "abc-123",
  titulo: "Desenvolvedor Full Stack",
  empresa: "Empresa XPTO",
  salario: 10000,
  modalidade: "Remoto",
  localidade: "São Paulo, SP",
  descricao: "Vaga para dev fullstack com experiência em Next.js e .NET",
  createdAt: new Date("2024-01-15"),
};

describe("JobCard", () => {
  it("deve renderizar as informações da vaga corretamente", () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText(mockJob.titulo)).toBeInTheDocument();
    expect(screen.getByText(mockJob.empresa)).toBeInTheDocument();
    expect(screen.getByText("Remoto")).toBeInTheDocument();
  });

  it("deve formatar o salário em BRL", () => {
    render(<JobCard job={mockJob} />);
    // R$ 10.000,00
    expect(screen.getByText(/R\$\s*10\.000/)).toBeInTheDocument();
  });

  it("deve chamar onCandidatar ao clicar no botão", () => {
    const onCandidatar = jest.fn();
    render(<JobCard job={mockJob} onCandidatar={onCandidatar} />);

    fireEvent.click(screen.getByRole("button", { name: /candidatar/i }));

    expect(onCandidatar).toHaveBeenCalledTimes(1);
    expect(onCandidatar).toHaveBeenCalledWith(mockJob.id);
  });

  it("deve exibir badge 'Remoto' com estilo correto", () => {
    render(<JobCard job={mockJob} />);
    const badge = screen.getByText("Remoto");
    expect(badge).toHaveClass("badge-remoto");
  });

  it("não deve renderizar salário se não informado", () => {
    const vagaSemSalario = { ...mockJob, salario: undefined };
    render(<JobCard job={vagaSemSalario} />);
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
});
