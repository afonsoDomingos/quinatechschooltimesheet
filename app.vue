<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <Activity class="h-8 w-8 text-blue-600 mr-3" />
            <h1 class="text-xl font-semibold text-gray-900">Plataforma de Atividades</h1>
          </div>
          <nav class="flex space-x-8">
            <button 
              @click="activeTab = 'colaboradores'"
              :class="['px-3 py-2 rounded-md text-sm font-medium', activeTab === 'colaboradores' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700']"
            >
              <Users class="w-4 h-4 inline mr-2" />
              Colaboradores
            </button>
            <button 
              @click="activeTab = 'atividades'"
              :class="['px-3 py-2 rounded-md text-sm font-medium', activeTab === 'atividades' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700']"
            >
              <CheckSquare class="w-4 h-4 inline mr-2" />
              Atividades
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Colaboradores -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <Users class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Colaboradores</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalColaboradores }}</p>
            </div>
          </div>
        </div>

        <!-- Total Atividades -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <Activity class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Atividades</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalAtividades }}</p>
            </div>
          </div>
        </div>

        <!-- Taxa de Conclusão -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <CheckSquare class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
              <p class="text-2xl font-semibold text-gray-900">{{ taxaConclusao }}%</p>
            </div>
          </div>
        </div>

        <!-- Atividades em Atraso -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <AlertTriangle class="w-6 h-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Em Atraso</p>
              <p class="text-2xl font-semibold text-gray-900">{{ atividadesAtraso }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Status -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
        <div class="space-y-3">
          <div v-for="(status, key) in statusDistribution" :key="key" class="flex items-center">
            <div class="flex-1">
              <div class="flex justify-between text-sm">
                <span class="font-medium text-gray-700">{{ getStatusLabel(key) }}</span>
                <span class="text-gray-500">
                  {{ status.count }} ({{ status.percentage }}%)
                </span>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-2">
                <div 
                  :class="getStatusBarClass(key)"
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${status.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colaboradores Tab -->
      <div v-if="activeTab === 'colaboradores'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">Gestão de Colaboradores</h2>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <button 
                @click="showExportMenu = !showExportMenu"
                class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Download class="w-4 h-4 mr-2" />
                Exportar
                <ChevronDown class="w-4 h-4 ml-2" />
              </button>
              <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div class="py-1">
                  <button 
                    @click="exportColaboradoresPDF"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FileText class="w-4 h-4 inline mr-2" />
                    Relatório PDF
                  </button>
                  <button 
                    @click="exportColaboradoresExcel"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FileSpreadsheet class="w-4 h-4 inline mr-2" />
                    Planilha Excel
                  </button>
                </div>
              </div>
            </div>
            <button 
              @click="showColaboradorForm = true"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus class="w-4 h-4 mr-2" />
              Novo Colaborador
            </button>
          </div>
        </div>

        <!-- Lista de Colaboradores -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="colaborador in colaboradores" 
            :key="colaborador.id"
            class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User class="w-6 h-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ colaborador.nome }}</h3>
                <p class="text-sm text-gray-500">{{ colaborador.cargo }}</p>
              </div>
            </div>
            <div class="space-y-2 text-sm text-gray-600">
              <p><Mail class="w-4 h-4 inline mr-2" />{{ colaborador.email }}</p>
              <p><Phone class="w-4 h-4 inline mr-2" />{{ colaborador.telefone }}</p>
              <p><Calendar class="w-4 h-4 inline mr-2" />{{ colaborador.departamento }}</p>
            </div>
            <div class="mt-4 flex justify-between items-center">
              <span class="text-sm text-gray-500">
                {{ getAtividadesCount(colaborador.id) }} atividades
              </span>
              <button 
                @click="editColaborador(colaborador)"
                class="text-blue-600 hover:text-blue-800"
              >
                <Edit2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Atividades Tab -->
      <div v-if="activeTab === 'atividades'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">Gestão de Atividades</h2>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <button 
                @click="showExportMenuAtividades = !showExportMenuAtividades"
                class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Download class="w-4 h-4 mr-2" />
                Exportar
                <ChevronDown class="w-4 h-4 ml-2" />
              </button>
              <div v-if="showExportMenuAtividades" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div class="py-1">
                  <button 
                    @click="exportAtividadesPDF"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FileText class="w-4 h-4 inline mr-2" />
                    Relatório PDF
                  </button>
                  <button 
                    @click="exportAtividadesExcel"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FileSpreadsheet class="w-4 h-4 inline mr-2" />
                    Planilha Excel
                  </button>
                  <button 
                    @click="exportRelatorioCompleto"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <BarChart3 class="w-4 h-4 inline mr-2" />
                    Relatório Completo
                  </button>
                </div>
              </div>
            </div>
            <button 
              @click="showAtividadeForm = true"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus class="w-4 h-4 mr-2" />
              Nova Atividade
            </button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Colaborador</label>
              <select v-model="filtroColaborador" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Todos os colaboradores</option>
                <option v-for="colaborador in colaboradores" :key="colaborador.id" :value="colaborador.id">
                  {{ colaborador.nome }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select v-model="filtroStatus" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
              <select v-model="filtroPrioridade" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Todas as prioridades</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Lista de Atividades -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atividade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="atividade in atividadesFiltradas" :key="atividade.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ atividade.titulo }}</div>
                      <div class="text-sm text-gray-500">{{ atividade.descricao }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ getColaboradorNome(atividade.colaboradorId) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(atividade.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatusLabel(atividade.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPrioridadeClass(atividade.prioridade)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getPrioridadeLabel(atividade.prioridade) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ atividade.duracao }}h
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(atividade.prazo) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      @click="editAtividade(atividade)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button 
                      @click="deleteAtividade(atividade.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Colaborador -->
    <div v-if="showColaboradorForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador' }}
            </h3>
            <button @click="closeColaboradorForm" class="text-gray-400 hover:text-gray-600">
              <X class="w-5 h-5" />
            </button>
          </div>
          <form @submit.prevent="saveColaborador" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input 
                v-model="colaboradorForm.nome" 
                type="text" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="colaboradorForm.email" 
                type="email" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input 
                v-model="colaboradorForm.telefone" 
                type="tel"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <input 
                v-model="colaboradorForm.cargo" 
                type="text" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <input 
                v-model="colaboradorForm.departamento" 
                type="text" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                @click="closeColaboradorForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {{ editingColaborador ? 'Atualizar' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Atividade -->
    <div v-if="showAtividadeForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingAtividade ? 'Editar Atividade' : 'Nova Atividade' }}
            </h3>
            <button @click="closeAtividadeForm" class="text-gray-400 hover:text-gray-600">
              <X class="w-5 h-5" />
            </button>
          </div>
          <form @submit.prevent="saveAtividade" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input 
                v-model="atividadeForm.titulo" 
                type="text" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea 
                v-model="atividadeForm.descricao" 
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
              <select 
                v-model="atividadeForm.colaboradorId" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione um colaborador</option>
                <option v-for="colaborador in colaboradores" :key="colaborador.id" :value="colaborador.id">
                  {{ colaborador.nome }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  v-model="atividadeForm.status" 
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em-andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select 
                  v-model="atividadeForm.prioridade" 
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duração (horas)</label>
                <input 
                  v-model.number="atividadeForm.duracao" 
                  type="number" 
                  min="0.5" 
                  step="0.5"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                <input 
                  v-model="atividadeForm.prazo" 
                  type="date" 
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
              </div>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                @click="closeAtividadeForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                {{ editingAtividade ? 'Atualizar' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { 
  Activity, Users, CheckSquare, Plus, User, Mail, Phone, Calendar, 
  Edit2, Trash2, X, Download, ChevronDown, FileText, FileSpreadsheet, 
  BarChart3, AlertTriangle
} from 'lucide-vue-next'

// Configuração Axios para seu backend
const api = axios.create({
  baseURL: 'https://apiplanact.onrender.com/api'
})

// Estado da aplicação
const activeTab = ref('colaboradores')
const showColaboradorForm = ref(false)
const showAtividadeForm = ref(false)
const editingColaborador = ref(null)
const editingAtividade = ref(null)

const showExportMenu = ref(false)
const showExportMenuAtividades = ref(false)

// Filtros
const filtroColaborador = ref('')
const filtroStatus = ref('')
const filtroPrioridade = ref('')

// Dados
const colaboradores = ref([])
const atividades = ref([])

// Formulários
const colaboradorForm = ref({
  nome: '',
  email: '',
  telefone: '',
  cargo: '',
  departamento: ''
})

const atividadeForm = ref({
  titulo: '',
  descricao: '',
  colaboradorId: '',
  status: 'pendente',
  prioridade: 'media',
  duracao: 1,
  prazo: ''
})

// Computed
const atividadesFiltradas = computed(() => {
  return atividades.value.filter(atividade => {
    const colaboradorMatch = !filtroColaborador.value || atividade.colaboradorId === filtroColaborador.value
    const statusMatch = !filtroStatus.value || atividade.status === filtroStatus.value
    const prioridadeMatch = !filtroPrioridade.value || atividade.prioridade === filtroPrioridade.value
    
    return colaboradorMatch && statusMatch && prioridadeMatch
  })
})

const totalColaboradores = computed(() => colaboradores.value.length)
const totalAtividades = computed(() => atividades.value.length)

const taxaConclusao = computed(() => {
  if (totalAtividades.value === 0) return 0
  const concluidas = atividades.value.filter(a => a.status === 'concluida').length
  return Math.round((concluidas / totalAtividades.value) * 100)
})

const atividadesAtraso = computed(() => {
  const hoje = new Date()
  return atividades.value.filter(atividade => {
    const prazo = new Date(atividade.prazo)
    return prazo < hoje && atividade.status !== 'concluida' && atividade.status !== 'cancelada'
  }).length
})

const statusDistribution = computed(() => {
  const distribution = {
    'pendente': { count: 0, percentage: 0 },
    'em-andamento': { count: 0, percentage: 0 },
    'concluida': { count: 0, percentage: 0 },
    'cancelada': { count: 0, percentage: 0 }
  }

  atividades.value.forEach(atividade => {
    distribution[atividade.status].count++
  })

  Object.keys(distribution).forEach(status => {
    distribution[status].percentage = totalAtividades.value > 0 
      ? Math.round((distribution[status].count / totalAtividades.value) * 100)
      : 0
  })

  return distribution
})

// Funções de exportação (mantive o seu código, pois exporta dos dados atuais)
// Funções de exportação
const exportColaboradoresPDF = async () => {
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')
  
  const doc = new jsPDF()
  
  // Cabeçalho
  doc.setFontSize(20)
  doc.text('Relatório de Colaboradores', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30)
  doc.text(`Total de Colaboradores: ${colaboradores.value.length}`, 20, 40)
  
  // Tabela de colaboradores
  const tableData = colaboradores.value.map(colaborador => [
    colaborador.nome,
    colaborador.cargo,
    colaborador.departamento,
    colaborador.email,
    colaborador.telefone,
    getAtividadesCount(colaborador.id).toString()
  ])
  
  doc.autoTable({
    head: [['Nome', 'Cargo', 'Departamento', 'Email', 'Telefone', 'Atividades']],
    body: tableData,
    startY: 50,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }
  })
  
  // Estatísticas por departamento
  const departamentos = {}
  colaboradores.value.forEach(colaborador => {
    if (!departamentos[colaborador.departamento]) {
      departamentos[colaborador.departamento] = 0
    }
    departamentos[colaborador.departamento]++
  })
  
  let yPosition = doc.lastAutoTable.finalY + 20
  doc.setFontSize(14)
  doc.text('Estatísticas por Departamento:', 20, yPosition)
  
  yPosition += 10
  doc.setFontSize(10)
  Object.entries(departamentos).forEach(([dept, count]) => {
    doc.text(`${dept}: ${count} colaboradores`, 20, yPosition)
    yPosition += 8
  })
  
  doc.save('relatorio-colaboradores.pdf')
  showExportMenu.value = false
}

const exportColaboradoresExcel = async () => {
  const XLSX = await import('xlsx')
  
  const wsData = [
    ['Nome', 'Cargo', 'Departamento', 'Email', 'Telefone', 'Atividades'],
    ...colaboradores.value.map(colaborador => [
      colaborador.nome,
      colaborador.cargo,
      colaborador.departamento,
      colaborador.email,
      colaborador.telefone,
      getAtividadesCount(colaborador.id)
    ])
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores')
  
  // Estatísticas
  const departamentos = {}
  colaboradores.value.forEach(colaborador => {
    if (!departamentos[colaborador.departamento]) {
      departamentos[colaborador.departamento] = 0
    }
    departamentos[colaborador.departamento]++
  })
  
  const statsData = [
    ['Departamento', 'Quantidade'],
    ...Object.entries(departamentos)
  ]
  
  const wsStats = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas')
  
  XLSX.writeFile(wb, 'relatorio-colaboradores.xlsx')
  showExportMenu.value = false
}

const exportAtividadesPDF = async () => {
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')
  
  const doc = new jsPDF()
  
  // Cabeçalho
  doc.setFontSize(20)
  doc.text('Relatório de Atividades', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30)
  doc.text(`Total de Atividades: ${atividadesFiltradas.value.length}`, 20, 40)
  
  // Tabela de atividades
  const tableData = atividadesFiltradas.value.map(atividade => [
    atividade.titulo,
    getColaboradorNome(atividade.colaboradorId),
    getStatusLabel(atividade.status),
    getPrioridadeLabel(atividade.prioridade),
    `${atividade.duracao}h`,
    formatDate(atividade.prazo)
  ])
  
  doc.autoTable({
    head: [['Atividade', 'Colaborador', 'Status', 'Prioridade', 'Duração', 'Prazo']],
    body: tableData,
    startY: 50,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 197, 94] }
  })
  
  // Estatísticas
  const stats = {
    pendente: atividades.value.filter(a => a.status === 'pendente').length,
    'em-andamento': atividades.value.filter(a => a.status === 'em-andamento').length,
    concluida: atividades.value.filter(a => a.status === 'concluida').length,
    cancelada: atividades.value.filter(a => a.status === 'cancelada').length
  }
  
  let yPosition = doc.lastAutoTable.finalY + 20
  doc.setFontSize(14)
  doc.text('Estatísticas por Status:', 20, yPosition)
  
  yPosition += 10
  doc.setFontSize(10)
  Object.entries(stats).forEach(([status, count]) => {
    doc.text(`${getStatusLabel(status)}: ${count} atividades`, 20, yPosition)
    yPosition += 8
  })
  
  doc.save('relatorio-atividades.pdf')
  showExportMenuAtividades.value = false
}

const exportAtividadesExcel = async () => {
  const XLSX = await import('xlsx')
  
  const wsData = [
    ['Título', 'Descrição', 'Colaborador', 'Status', 'Prioridade', 'Duração (h)', 'Prazo'],
    ...atividadesFiltradas.value.map(atividade => [
      atividade.titulo,
      atividade.descricao,
      getColaboradorNome(atividade.colaboradorId),
      getStatusLabel(atividade.status),
      getPrioridadeLabel(atividade.prioridade),
      atividade.duracao,
      formatDate(atividade.prazo)
    ])
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Atividades')
  
  // Estatísticas por Status
  const statusStats = [
    ['Status', 'Quantidade'],
    ['Pendente', atividades.value.filter(a => a.status === 'pendente').length],
    ['Em Andamento', atividades.value.filter(a => a.status === 'em-andamento').length],
    ['Concluída', atividades.value.filter(a => a.status === 'concluida').length],
    ['Cancelada', atividades.value.filter(a => a.status === 'cancelada').length]
  ]
  
  const wsStatusStats = XLSX.utils.aoa_to_sheet(statusStats)
  XLSX.utils.book_append_sheet(wb, wsStatusStats, 'Status')
  
  // Estatísticas por Prioridade
  const prioridadeStats = [
    ['Prioridade', 'Quantidade'],
    ['Baixa', atividades.value.filter(a => a.prioridade === 'baixa').length],
    ['Média', atividades.value.filter(a => a.prioridade === 'media').length],
    ['Alta', atividades.value.filter(a => a.prioridade === 'alta').length]
  ]
  
  const wsPrioridadeStats = XLSX.utils.aoa_to_sheet(prioridadeStats)
  XLSX.utils.book_append_sheet(wb, wsPrioridadeStats, 'Prioridades')
  
  XLSX.writeFile(wb, 'relatorio-atividades.xlsx')
  showExportMenuAtividades.value = false
}

const exportRelatorioCompleto = async () => {
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')
  
  const doc = new jsPDF()
  
  // Página 1 - Resumo Executivo
  doc.setFontSize(24)
  doc.text('Relatório Completo de Atividades', 20, 30)
  
  doc.setFontSize(12)
  doc.text(`Período: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50)
  
  // Resumo geral
  doc.setFontSize(16)
  doc.text('Resumo Executivo', 20, 70)
  
  doc.setFontSize(12)
  const atividadesConcluidas = atividades.value.filter(a => a.status === 'concluida').length
  const percentualConclusao = totalAtividades.value > 0 ? ((atividadesConcluidas / totalAtividades.value) * 100).toFixed(1) : 0
  
  doc.text(`• Total de Colaboradores: ${totalColaboradores.value}`, 20, 85)
  doc.text(`• Total de Atividades: ${totalAtividades.value}`, 20, 95)
  doc.text(`• Atividades Concluídas: ${atividadesConcluidas}`, 20, 105)
  doc.text(`• Taxa de Conclusão: ${percentualConclusao}%`, 20, 115)
  
  // Produtividade por colaborador
  doc.setFontSize(16)
  doc.text('Produtividade por Colaborador', 20, 140)
  
  const produtividade = colaboradores.value.map(colaborador => {
    const atividadesColaborador = atividades.value.filter(a => a.colaboradorId === colaborador.id)
    const concluidas = atividadesColaborador.filter(a => a.status === 'concluida').length
    const total = atividadesColaborador.length
    const percentual = total > 0 ? ((concluidas / total) * 100).toFixed(1) : 0
    
    return [
      colaborador.nome,
      colaborador.departamento,
      total.toString(),
      concluidas.toString(),
      `${percentual}%`
    ]
  })
  
  doc.autoTable({
    head: [['Colaborador', 'Departamento', 'Total', 'Concluídas', 'Taxa']],
    body: produtividade,
    startY: 150,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] }
  })
  
  // Nova página para atividades em atraso
  doc.addPage()
  doc.setFontSize(20)
  doc.text('Atividades em Atraso', 20, 30)
  
  const hoje = new Date()
  const atividadesAtrasoList = atividades.value.filter(atividade => {
    const prazo = new Date(atividade.prazo)
    return prazo < hoje && atividade.status !== 'concluida' && atividade.status !== 'cancelada'
  })
  
  if (atividadesAtrasoList.length > 0) {
    const dadosAtraso = atividadesAtrasoList.map(atividade => [
      atividade.titulo,
      getColaboradorNome(atividade.colaboradorId),
      getStatusLabel(atividade.status),
      formatDate(atividade.prazo),
      Math.ceil((hoje - new Date(atividade.prazo)) / (1000 * 60 * 60 * 24)) + ' dias'
    ])
    
    doc.autoTable({
      head: [['Atividade', 'Colaborador', 'Status', 'Prazo', 'Atraso']],
      body: dadosAtraso,
      startY: 50,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [239, 68, 68] }
    })
  } else {
    doc.setFontSize(12)
    doc.text('Nenhuma atividade em atraso encontrada.', 20, 50)
  }
  
  doc.save('relatorio-completo.pdf')
  showExportMenuAtividades.value = false
}


// Métodos para sincronização com backend

// Colaboradores
const fetchColaboradores = async () => {
  try {
    const res = await api.get('/colaboradores')
    colaboradores.value = res.data
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
  }
}

const saveColaboradorBackend = async (colaborador) => {
  try {
    if (colaborador.id) {
      await api.put(`/colaboradores/${colaborador.id}`, colaborador)
    } else {
      await api.post('/colaboradores', colaborador)
    }
    await fetchColaboradores()
  } catch (error) {
    console.error('Erro ao salvar colaborador:', error)
  }
}

const deleteColaboradorBackend = async (id) => {
  try {
    await api.delete(`/colaboradores/${id}`)
    await fetchColaboradores()
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error)
  }
}

// Atividades
const fetchAtividades = async () => {
  try {
    const res = await api.get('/atividades')
    atividades.value = res.data
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
  }
}

const saveAtividadeBackend = async (atividade) => {
  try {
    if (atividade.id) {
      await api.put(`/atividades/${atividade.id}`, atividade)
    } else {
      await api.post('/atividades', atividade)
    }
    await fetchAtividades()
  } catch (error) {
    console.error('Erro ao salvar atividade:', error)
  }
}

const deleteAtividadeBackend = async (id) => {
  try {
    await api.delete(`/atividades/${id}`)
    await fetchAtividades()
  } catch (error) {
    console.error('Erro ao deletar atividade:', error)
  }
}

// Métodos substituindo os locais por chamadas backend

const saveColaborador = async () => {
  await saveColaboradorBackend(colaboradorForm.value)
  closeColaboradorForm()
}

const editColaborador = (colaborador) => {
  editingColaborador.value = colaborador
  colaboradorForm.value = { ...colaborador }
  showColaboradorForm.value = true
}

const closeColaboradorForm = () => {
  showColaboradorForm.value = false
  editingColaborador.value = null
  colaboradorForm.value = {
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    departamento: ''
  }
}

const saveAtividade = async () => {
  await saveAtividadeBackend(atividadeForm.value)
  closeAtividadeForm()
}

const editAtividade = (atividade) => {
  editingAtividade.value = atividade
  atividadeForm.value = { ...atividade }
  showAtividadeForm.value = true
}

const deleteAtividade = async (id) => {
  if (confirm('Tem certeza que deseja excluir esta atividade?')) {
    await deleteAtividadeBackend(id)
  }
}

const closeAtividadeForm = () => {
  showAtividadeForm.value = false
  editingAtividade.value = null
  atividadeForm.value = {
    titulo: '',
    descricao: '',
    colaboradorId: '',
    status: 'pendente',
    prioridade: 'media',
    duracao: 1,
    prazo: ''
  }
}

// Métodos utilitários (mantidos do seu código)

const getColaboradorNome = (id) => {
  const colaborador = colaboradores.value.find(c => c.id === id)
  return colaborador ? colaborador.nome : 'N/A'
}

const getAtividadesCount = (colaboradorId) => {
  return atividades.value.filter(a => a.colaboradorId === colaboradorId).length
}

const getStatusClass = (status) => {
  const classes = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'em-andamento': 'bg-blue-100 text-blue-800',
    'concluida': 'bg-green-100 text-green-800',
    'cancelada': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'pendente': 'Pendente',
    'em-andamento': 'Em Andamento',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada'
  }
  return labels[status] || status
}

const getPrioridadeClass = (prioridade) => {
  const classes = {
    'baixa': 'bg-gray-100 text-gray-800',
    'media': 'bg-yellow-100 text-yellow-800',
    'alta': 'bg-red-100 text-red-800'
  }
  return classes[prioridade] || 'bg-gray-100 text-gray-800'
}

const getPrioridadeLabel = (prioridade) => {
  const labels = {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta'
  }
  return labels[prioridade] || prioridade
}

const getStatusBarClass = (status) => {
  const classes = {
    'pendente': 'bg-yellow-500',
    'em-andamento': 'bg-blue-500',
    'concluida': 'bg-green-500',
    'cancelada': 'bg-red-500'
  }
  return classes[status] || 'bg-gray-500'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

// Inicialização
onMounted(() => {
  fetchColaboradores()
  fetchAtividades()

  // Fechar menus ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showExportMenu.value = false
      showExportMenuAtividades.value = false
    }
  })
})
</script>

<style scoped>
/* Estilos adicionais se necessário */
</style>
