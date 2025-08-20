<template>
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
            <span class="text-gray-500">{{ status.count }} ({{ status.percentage }}%)</span>
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
</template>

<script setup>
import { computed } from 'vue'
import { Users, Activity, CheckSquare, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  colaboradores: Array,
  atividades: Array
})

const totalColaboradores = computed(() => props.colaboradores.length)
const totalAtividades = computed(() => props.atividades.length)

const taxaConclusao = computed(() => {
  if (totalAtividades.value === 0) return 0
  const concluidas = props.atividades.filter(a => a.status === 'concluida').length
  return Math.round((concluidas / totalAtividades.value) * 100)
})

const atividadesAtraso = computed(() => {
  const hoje = new Date()
  return props.atividades.filter(atividade => {
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

  props.atividades.forEach(atividade => {
    distribution[atividade.status].count++
  })

  Object.keys(distribution).forEach(status => {
    distribution[status].percentage = totalAtividades.value > 0 
      ? Math.round((distribution[status].count / totalAtividades.value) * 100)
      : 0
  })

  return distribution
})

const getStatusLabel = (status) => {
  const labels = {
    'pendente': 'Pendente',
    'em-andamento': 'Em Andamento',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada'
  }
  return labels[status] || status
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
</script>
