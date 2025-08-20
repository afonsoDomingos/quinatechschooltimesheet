"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Activity,
  Users,
  CheckSquare,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  X,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Colaborador {
  _id: string // Changed from 'id' to '_id' to match typical MongoDB IDs
  nome: string
  email: string
  telefone: string
  cargo: string
  departamento: string
}

interface Atividade {
  _id: string // Changed from 'id' to '_id' to match typical MongoDB IDs
  titulo: string
  descricao: string
  colaboradorId: string
  status: "pendente" | "em-andamento" | "concluida" | "cancelada"
  prioridade: "baixa" | "media" | "alta"
  duracao: number
  prazo: string
}

const API_BASE_URL = "https://apiplanact.onrender.com/api"

export default function PlataformaAtividades() {
  // Estado da aplicação
  const [activeTab, setActiveTab] = useState<"colaboradores" | "atividades">("colaboradores")
  const [showColaboradorForm, setShowColaboradorForm] = useState(false)
  const [showAtividadeForm, setShowAtividadeForm] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null)
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null)

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showExportMenuAtividades, setShowExportMenuAtividades] = useState(false)

  // Filtros
  const [filtroColaborador, setFiltroColaborador] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [filtroPrioridade, setFiltroPrioridade] = useState("")

  // Dados
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true); // New state for loading indicator
  const [error, setError] = useState<string | null>(null); // New state for error handling


  // Formulários
  const [colaboradorForm, setColaboradorForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
  })

  const [atividadeForm, setAtividadeForm] = useState({
    titulo: "",
    descricao: "",
    colaboradorId: "",
    status: "pendente" as const,
    prioridade: "media" as const,
    duracao: 1,
    prazo: "",
  })

  // Computed values (These remain largely the same, but will now operate on fetched data)
  const atividadesFiltradas = useMemo(() => {
    return atividades.filter((atividade) => {
      const colaboradorMatch = !filtroColaborador || atividade.colaboradorId === filtroColaborador
      const statusMatch = !filtroStatus || atividade.status === filtroStatus
      const prioridadeMatch = !filtroPrioridade || atividade.prioridade === filtroPrioridade

      return colaboradorMatch && statusMatch && prioridadeMatch
    })
  }, [atividades, filtroColaborador, filtroStatus, filtroPrioridade])

  const totalColaboradores = colaboradores.length
  const totalAtividades = atividades.length

  const taxaConclusao = useMemo(() => {
    if (totalAtividades === 0) return 0
    const concluidas = atividades.filter((a) => a.status === "concluida").length
    return Math.round((concluidas / totalAtividades) * 100)
  }, [atividades, totalAtividades])

  const atividadesAtraso = useMemo(() => {
    const hoje = new Date()
    return atividades.filter((atividade) => {
      const prazo = new Date(atividade.prazo)
      return prazo < hoje && atividade.status !== "concluida" && atividade.status !== "cancelada"
    }).length
  }, [atividades])

  const statusDistribution = useMemo(() => {
    const distribution = {
      pendente: { count: 0, percentage: 0 },
      "em-andamento": { count: 0, percentage: 0 },
      concluida: { count: 0, percentage: 0 },
      cancelada: { count: 0, percentage: 0 },
    }

    atividades.forEach((atividade) => {
      distribution[atividade.status].count++
    })

    Object.keys(distribution).forEach((status) => {
      const key = status as keyof typeof distribution
      distribution[key].percentage =
        totalAtividades > 0 ? Math.round((distribution[key].count / totalAtividades) * 100) : 0
    })

    return distribution
  }, [atividades, totalAtividades])

  // --- Data Fetching Functions ---
  const fetchColaboradores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setColaboradores(data);
    } catch (e: any) {
      setError(`Failed to fetch collaborators: ${e.message}`);
      console.error("Failed to fetch collaborators:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAtividades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/atividades`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAtividades(data);
    } catch (e: any) {
      setError(`Failed to fetch activities: ${e.message}`);
      console.error("Failed to fetch activities:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect to fetch data on component mount ---
  useEffect(() => {
    fetchColaboradores();
    fetchAtividades();
  }, []); // Empty dependency array means this runs once on mount

  // Funções de exportação (Remain the same, as they operate on the current state data)
  const exportColaboradoresPDF = async () => {
    const { jsPDF } = await import("jspdf")
    await import("jspdf-autotable")

    const doc = new jsPDF()

    // Cabeçalho
    doc.setFontSize(20)
    doc.text("Relatório de Colaboradores", 20, 20)

    doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 30)
    doc.text(`Total de Colaboradores: ${colaboradores.length}`, 20, 40)

    // Tabela de colaboradores
    const tableData = colaboradores.map((colaborador) => [
      colaborador.nome,
      colaborador.cargo,
      colaborador.departamento,
      colaborador.email,
      colaborador.telefone,
      getAtividadesCount(colaborador._id).toString(), // Use _id here
    ])
    ;(doc as any).autoTable({
      head: [["Nome", "Cargo", "Departamento", "Email", "Telefone", "Atividades"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Estatísticas por departamento
    const departamentos: Record<string, number> = {}
    colaboradores.forEach((colaborador) => {
      if (!departamentos[colaborador.departamento]) {
        departamentos[colaborador.departamento] = 0
      }
      departamentos[colaborador.departamento]++
    })

    let yPosition = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(14)
    doc.text("Estatísticas por Departamento:", 20, yPosition)

    yPosition += 10
    doc.setFontSize(10)
    Object.entries(departamentos).forEach(([dept, count]) => {
      doc.text(`${dept}: ${count} colaboradores`, 20, yPosition)
      yPosition += 8
    })

    doc.save("relatorio-colaboradores.pdf")
    setShowExportMenu(false)
  }

  const exportColaboradoresExcel = async () => {
    const XLSX = await import("xlsx")

    const wsData = [
      ["Nome", "Cargo", "Departamento", "Email", "Telefone", "Atividades"],
      ...colaboradores.map((colaborador) => [
        colaborador.nome,
        colaborador.cargo,
        colaborador.departamento,
        colaborador.email,
        colaborador.telefone,
        getAtividadesCount(colaborador._id), // Use _id here
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Colaboradores")

    // Estatísticas
    const departamentos: Record<string, number> = {}
    colaboradores.forEach((colaborador) => {
      if (!departamentos[colaborador.departamento]) {
        departamentos[colaborador.departamento] = 0
      }
      departamentos[colaborador.departamento]++
    })

    const statsData = [["Departamento", "Quantidade"], ...Object.entries(departamentos)]

    const wsStats = XLSX.utils.aoa_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, "Estatísticas")

    XLSX.writeFile(wb, "relatorio-colaboradores.xlsx")
    setShowExportMenu(false)
  }

  const exportAtividadesPDF = async () => {
    const { jsPDF } = await import("jspdf")
    await import("jspdf-autotable")

    const doc = new jsPDF()

    // Cabeçalho
    doc.setFontSize(20)
    doc.text("Relatório de Atividades", 20, 20)

    doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 30)
    doc.text(`Total de Atividades: ${atividadesFiltradas.length}`, 20, 40)

    // Tabela de atividades
    const tableData = atividadesFiltradas.map((atividade) => [
      atividade.titulo,
      getColaboradorNome(atividade.colaboradorId),
      getStatusLabel(atividade.status),
      getPrioridadeLabel(atividade.prioridade),
      `${atividade.duracao}h`,
      formatDate(atividade.prazo),
    ])
    ;(doc as any).autoTable({
      head: [["Atividade", "Colaborador", "Status", "Prioridade", "Duração", "Prazo"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    })

    // Estatísticas
    const stats = {
      pendente: atividades.filter((a) => a.status === "pendente").length,
      "em-andamento": atividades.filter((a) => a.status === "em-andamento").length,
      concluida: atividades.filter((a) => a.status === "concluida").length,
      cancelada: atividades.filter((a) => a.status === "cancelada").length,
    }

    let yPosition = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(14)
    doc.text("Estatísticas por Status:", 20, yPosition)

    yPosition += 10
    doc.setFontSize(10)
    Object.entries(stats).forEach(([status, count]) => {
      doc.text(`${getStatusLabel(status as any)}: ${count} atividades`, 20, yPosition)
      yPosition += 8
    })

    doc.save("relatorio-atividades.pdf")
    setShowExportMenuAtividades(false)
  }

  const exportAtividadesExcel = async () => {
    const XLSX = await import("xlsx")

    const wsData = [
      ["Título", "Descrição", "Colaborador", "Status", "Prioridade", "Duração (h)", "Prazo"],
      ...atividadesFiltradas.map((atividade) => [
        atividade.titulo,
        atividade.descricao,
        getColaboradorNome(atividade.colaboradorId),
        getStatusLabel(atividade.status),
        getPrioridadeLabel(atividade.prioridade),
        atividade.duracao,
        formatDate(atividade.prazo),
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Atividades")

    // Estatísticas por Status
    const statusStats = [
      ["Status", "Quantidade"],
      ["Pendente", atividades.filter((a) => a.status === "pendente").length],
      ["Em Andamento", atividades.filter((a) => a.status === "em-andamento").length],
      ["Concluída", atividades.filter((a) => a.status === "concluida").length],
      ["Cancelada", atividades.filter((a) => a.status === "cancelada").length],
    ]

    const wsStatusStats = XLSX.utils.aoa_to_sheet(statusStats)
    XLSX.utils.book_append_sheet(wb, wsStatusStats, "Status")

    // Estatísticas por Prioridade
    const prioridadeStats = [
      ["Prioridade", "Quantidade"],
      ["Baixa", atividades.filter((a) => a.prioridade === "baixa").length],
      ["Média", atividades.filter((a) => a.prioridade === "media").length],
      ["Alta", atividades.filter((a) => a.prioridade === "alta").length],
    ]

    const wsPrioridadeStats = XLSX.utils.aoa_to_sheet(prioridadeStats)
    XLSX.utils.book_append_sheet(wb, wsPrioridadeStats, "Prioridades")

    XLSX.writeFile(wb, "relatorio-atividades.xlsx")
    setShowExportMenuAtividades(false)
  }

  const exportRelatorioCompleto = async () => {
    const { jsPDF } = await import("jspdf")
    await import("jspdf-autotable")

    const doc = new jsPDF()

    // Página 1 - Resumo Executivo
    doc.setFontSize(24)
    doc.text("Relatório Completo de Atividades", 20, 30)

    doc.setFontSize(12)
    doc.text(`Período: ${new Date().toLocaleDateString("pt-BR")}`, 20, 50)

    // Resumo geral
    doc.setFontSize(16)
    doc.text("Resumo Executivo", 20, 70)

    doc.setFontSize(12)
    const atividadesConcluidas = atividades.filter((a) => a.status === "concluida").length
    const percentualConclusao = totalAtividades > 0 ? ((atividadesConcluidas / totalAtividades) * 100).toFixed(1) : "0"

    doc.text(`• Total de Colaboradores: ${totalColaboradores}`, 20, 85)
    doc.text(`• Total de Atividades: ${totalAtividades}`, 20, 95)
    doc.text(`• Atividades Concluídas: ${atividadesConcluidas}`, 20, 105)
    doc.text(`• Taxa de Conclusão: ${percentualConclusao}%`, 20, 115)

    // Produtividade por colaborador
    doc.setFontSize(16)
    doc.text("Produtividade por Colaborador", 20, 140)

    const produtividade = colaboradores.map((colaborador) => {
      const atividadesColaborador = atividades.filter((a) => a.colaboradorId === colaborador._id) // Use _id here
      const concluidas = atividadesColaborador.filter((a) => a.status === "concluida").length
      const total = atividadesColaborador.length
      const percentual = total > 0 ? ((concluidas / total) * 100).toFixed(1) : "0"

      return [colaborador.nome, colaborador.departamento, total.toString(), concluidas.toString(), `${percentual}%`]
    })
    ;(doc as any).autoTable({
      head: [["Colaborador", "Departamento", "Total", "Concluídas", "Taxa"]],
      body: produtividade,
      startY: 150,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    // Nova página para atividades em atraso
    doc.addPage()
    doc.setFontSize(20)
    doc.text("Atividades em Atraso", 20, 30)

    const hoje = new Date()
    const atividadesAtrasoList = atividades.filter((atividade) => {
      const prazo = new Date(atividade.prazo)
      return prazo < hoje && atividade.status !== "concluida" && atividade.status !== "cancelada"
    })

    if (atividadesAtrasoList.length > 0) {
      const dadosAtraso = atividadesAtrasoList.map((atividade) => [
        atividade.titulo,
        getColaboradorNome(atividade.colaboradorId),
        getStatusLabel(atividade.status),
        formatDate(atividade.prazo),
        Math.ceil((hoje.getTime() - new Date(atividade.prazo).getTime()) / (1000 * 60 * 60 * 24)) + " dias",
      ])
      ;(doc as any).autoTable({
        head: [["Atividade", "Colaborador", "Status", "Prazo", "Atraso"]],
        body: dadosAtraso,
        startY: 50,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [239, 68, 68] },
      })
    } else {
      doc.setFontSize(12)
      doc.text("Nenhuma atividade em atraso encontrada.", 20, 50)
    }

    doc.save("relatorio-completo.pdf")
    setShowExportMenuAtividades(false)
  }

  // --- Modified Methods for Collaborators to Interact with API ---
  const saveColaborador = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (editingColaborador) {
        // Update existing collaborator
        response = await fetch(`${API_BASE_URL}/colaboradores/${editingColaborador._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colaboradorForm),
        });
      } else {
        // Create new collaborator
        response = await fetch(`${API_BASE_URL}/colaboradores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colaboradorForm),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Re-fetch data to ensure UI is in sync with backend
      await fetchColaboradores();
      closeColaboradorForm();
    } catch (e: any) {
      setError(`Failed to save collaborator: ${e.message}`);
      console.error("Failed to save collaborator:", e);
    } finally {
      setLoading(false);
    }
  }

  const editColaborador = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador)
    setColaboradorForm({ ...colaborador })
    setShowColaboradorForm(true)
  }

  const deleteColaborador = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este colaborador? Todas as atividades associadas a ele podem ficar sem colaborador.")) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/colaboradores/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Re-fetch data to ensure UI is in sync with backend
        await fetchColaboradores();
        await fetchAtividades(); // Also re-fetch activities as they might be affected
      } catch (e: any) {
        setError(`Failed to delete collaborator: ${e.message}`);
        console.error("Failed to delete collaborator:", e);
      } finally {
        setLoading(false);
      }
    }
  }

  const closeColaboradorForm = () => {
    setShowColaboradorForm(false)
    setEditingColaborador(null)
    setColaboradorForm({
      nome: "",
      email: "",
      telefone: "",
      cargo: "",
      departamento: "",
    })
  }

  // --- Modified Methods for Activities to Interact with API ---
  const saveAtividade = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (editingAtividade) {
        // Update existing activity
        response = await fetch(`${API_BASE_URL}/atividades/${editingAtividade._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(atividadeForm),
        });
      } else {
        // Create new activity
        response = await fetch(`${API_BASE_URL}/atividades`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(atividadeForm),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Re-fetch data
      await fetchAtividades();
      closeAtividadeForm();
    } catch (e: any) {
      setError(`Failed to save activity: ${e.message}`);
      console.error("Failed to save activity:", e);
    } finally {
      setLoading(false);
    }
  }

  const editAtividade = (atividade: Atividade) => {
    setEditingAtividade(atividade)
    setAtividadeForm({ ...atividade })
    setShowAtividadeForm(true)
  }

  const deleteAtividade = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/atividades/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Re-fetch data
        await fetchAtividades();
      } catch (e: any) {
        setError(`Failed to delete activity: ${e.message}`);
        console.error("Failed to delete activity:", e);
      } finally {
        setLoading(false);
      }
    }
  }

  const closeAtividadeForm = () => {
    setShowAtividadeForm(false)
    setEditingAtividade(null)
    setAtividadeForm({
      titulo: "",
      descricao: "",
      colaboradorId: "",
      status: "pendente",
      prioridade: "media",
      duracao: 1,
      prazo: "",
    })
  }

  // Métodos utilitários (These largely remain the same, but now `getColaboradorNome`
  // will work with the fetched `colaboradores` array and IDs from activities)
  const getColaboradorNome = (id: string) => {
    const colaborador = colaboradores.find((c) => c._id === id) // Use _id here
    return colaborador ? colaborador.nome : "N/A"
  }

  const getAtividadesCount = (colaboradorId: string) => {
    return atividades.filter((a) => a.colaboradorId === colaboradorId).length
  }

  const getStatusClass = (status: string) => {
    const classes = {
      pendente: "bg-yellow-100 text-yellow-800",
      "em-andamento": "bg-blue-100 text-blue-800",
      concluida: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    }
    return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: "Pendente",
      "em-andamento": "Em Andamento",
      concluida: "Concluída",
      cancelada: "Cancelada",
    }
    return labels[status as keyof typeof labels] || status
  }

  const getPrioridadeClass = (prioridade: string) => {
    const classes = {
      baixa: "bg-gray-100 text-gray-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
    }
    return classes[prioridade as keyof typeof classes] || "bg-gray-100 text-gray-800"
  }

  const getPrioridadeLabel = (prioridade: string) => {
    const labels = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
    }
    return labels[prioridade as keyof typeof labels] || prioridade
  }

  const getStatusBarClass = (status: string) => {
    const classes = {
      pendente: "bg-yellow-500",
      "em-andamento": "bg-blue-500",
      concluida: "bg-green-500",
      cancelada: "bg-red-500",
    }
    return classes[status as keyof typeof classes] || "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest(".relative")) {
        setShowExportMenu(false)
        setShowExportMenuAtividades(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Plano de Actividades MUV</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("colaboradores")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "colaboradores" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Colaboradores
              </button>
              <button
                onClick={() => setActiveTab("atividades")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "atividades" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <CheckSquare className="w-4 h-4 inline mr-2" />
                Atividades
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading && <p className="text-center text-blue-600">Carregando dados...</p>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Colaboradores */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Colaboradores</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalColaboradores}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Atividades */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Atividades</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalAtividades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taxa de Conclusão */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                  <p className="text-2xl font-semibold text-gray-900">{taxaConclusao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades em Atraso */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                  <p className="text-2xl font-semibold text-gray-900">{atividadesAtraso}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
            <div className="space-y-3">
              {Object.entries(statusDistribution).map(([key, status]) => (
                <div key={key} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{getStatusLabel(key)}</span>
                      <span className="text-gray-500">
                        {status.count} ({status.percentage}%)
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStatusBarClass(key)}`}
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colaboradores Tab */}
        {activeTab === "colaboradores" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Colaboradores</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        <button
                          onClick={exportColaboradoresPDF}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileText className="w-4 h-4 inline mr-2" />
                          Relatório PDF
                        </button>
                        <button
                          onClick={exportColaboradoresExcel}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                          Planilha Excel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={() => setShowColaboradorForm(true)} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Colaborador
                </Button>
              </div>
            </div>

            {/* Lista de Colaboradores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colaboradores.map((colaborador) => (
                <Card key={colaborador._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{colaborador.nome}</h3>
                        <p className="text-sm text-gray-500">{colaborador.cargo}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <Mail className="w-4 h-4 inline mr-2" />
                        {colaborador.email}
                      </p>
                      <p>
                        <Phone className="w-4 h-4 inline mr-2" />
                        {colaborador.telefone}
                      </p>
                      <p>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {colaborador.departamento}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{getAtividadesCount(colaborador._id)} atividades</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editColaborador(colaborador)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteColaborador(colaborador._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

       {activeTab === "atividades" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Gestão de Atividades</h2>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Button
            onClick={() => setShowExportMenuAtividades(!showExportMenuAtividades)}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
          {showExportMenuAtividades && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={exportAtividadesPDF}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Relatório PDF
                </button>
                <button
                  onClick={exportAtividadesExcel}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                  Planilha Excel
                </button>
                <button
                  onClick={exportRelatorioCompleto}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Relatório Completo
                </button>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowAtividadeForm(true)}
          className="flex items-center bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Atividade
        </Button>
      </div>
    </div>

    {/* Filtros */}
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colaborador</label>
            <select
              value={filtroColaborador}
              onChange={(e) => setFiltroColaborador(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos os colaboradores</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador._id} value={colaborador._id}>
                  {colaborador.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todas as prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Lista de Atividades em Tabela */}
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atividade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {atividadesFiltradas.map((atividade) => (
              <tr key={atividade._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{atividade.titulo}</div>
                    <div className="text-sm text-gray-500">{atividade.descricao}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getColaboradorNome(atividade.colaboradorId)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(atividade.status)}`}>
                    {getStatusLabel(atividade.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPrioridadeClass(atividade.prioridade)}`}>
                    {getPrioridadeLabel(atividade.prioridade)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{atividade.duracao}h</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(atividade.prazo)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => editAtividade(atividade)} className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAtividade(atividade._id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
)}


        {/* Modal para Adicionar/Editar Colaborador */}
        {showColaboradorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingColaborador ? "Editar Colaborador" : "Adicionar Novo Colaborador"}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={closeColaboradorForm}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveColaborador()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="nome"
                      value={colaboradorForm.nome}
                      onChange={(e) => setColaboradorForm({ ...colaboradorForm, nome: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={colaboradorForm.email}
                      onChange={(e) => setColaboradorForm({ ...colaboradorForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      value={colaboradorForm.telefone}
                      onChange={(e) => setColaboradorForm({ ...colaboradorForm, telefone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                      Cargo
                    </label>
                    <input
                      type="text"
                      id="cargo"
                      value={colaboradorForm.cargo}
                      onChange={(e) => setColaboradorForm({ ...colaboradorForm, cargo: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                      Departamento
                    </label>
                    <input
                      type="text"
                      id="departamento"
                      value={colaboradorForm.departamento}
                      onChange={(e) => setColaboradorForm({ ...colaboradorForm, departamento: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeColaboradorForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para Adicionar/Editar Atividade */}
        {showAtividadeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingAtividade ? "Editar Atividade" : "Adicionar Nova Atividade"}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={closeAtividadeForm}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveAtividade()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      value={atividadeForm.titulo}
                      onChange={(e) => setAtividadeForm({ ...atividadeForm, titulo: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="descricao"
                      value={atividadeForm.descricao}
                      onChange={(e) => setAtividadeForm({ ...atividadeForm, descricao: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="colaborador" className="block text-sm font-medium text-gray-700">
                      Colaborador
                    </label>
                    <select
                      id="colaborador"
                      value={atividadeForm.colaboradorId}
                      onChange={(e) => setAtividadeForm({ ...atividadeForm, colaboradorId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    >
                      <option value="">Selecione um colaborador</option>
                      {colaboradores.map((colaborador) => (
                        <option key={colaborador._id} value={colaborador._id}>
                          {colaborador.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        value={atividadeForm.status}
                        onChange={(e) =>
                          setAtividadeForm({
                            ...atividadeForm,
                            status: e.target.value as "pendente" | "em-andamento" | "concluida" | "cancelada",
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em-andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700">
                        Prioridade
                      </label>
                      <select
                        id="prioridade"
                        value={atividadeForm.prioridade}
                        onChange={(e) =>
                          setAtividadeForm({
                            ...atividadeForm,
                            prioridade: e.target.value as "baixa" | "media" | "alta",
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="duracao" className="block text-sm font-medium text-gray-700">
                        Duração (horas)
                      </label>
                      <input
                        type="number"
                        id="duracao"
                        value={atividadeForm.duracao}
                        onChange={(e) => setAtividadeForm({ ...atividadeForm, duracao: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="prazo" className="block text-sm font-medium text-gray-700">
                        Prazo
                      </label>
                      <input
                        type="date"
                        id="prazo"
                        value={atividadeForm.prazo}
                        onChange={(e) => setAtividadeForm({ ...atividadeForm, prazo: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeAtividadeForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Salvar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}