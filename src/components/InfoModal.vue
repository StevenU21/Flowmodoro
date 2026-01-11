<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm transition-opacity" @click.self="emit('close')">
    <div class="bg-slate-800 border border-slate-700 p-8 rounded-xl max-w-md w-full shadow-2xl relative">
      <button @click="emit('close')" class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">✕</button>
      
      <h2 class="text-2xl font-bold text-teal-400 mb-6 tracking-wide">Método Flowmodoro</h2>
      
      <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          <strong class="text-teal-200">1. Enfócate (Flow):</strong>
          El cronómetro cuenta hacia arriba. Trabaja hasta cansarte.
        </p>
        <p>
          <strong class="text-teal-200">2. Descansa (Ratio 5:1):</strong>
          5 min trabajo = 1 min descanso. El tiempo se acumula en el "Banco".
        </p>
        <p>
          <strong class="text-teal-200">3. Nuevo Ciclo:</strong>
          Al registrar descanso, tu tiempo se guarda en el historial y comienza la cuenta regresiva.
        </p>
        
        <div class="border-t border-slate-700 pt-4 mt-4">
          <p class="text-slate-400 text-xs leading-relaxed">
            <strong class="text-slate-300">Límite Cognitivo:</strong>
            La investigación muestra que el cerebro solo puede sostener 4-6 horas de aprendizaje profundo real por día. 
            Más allá de esto, la calidad del trabajo cae drásticamente.
          </p>
          <a 
            href="https://graphics8.nytimes.com/images/blogs/freakonomics/pdf/DeliberatePractice(PsychologicalReview).pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-teal-400 hover:text-teal-300 text-xs underline decoration-teal-500/30 hover:decoration-teal-300 transition-colors mt-2 inline-block"
          >
            Ver estudio: Deliberate Practice (Ericsson et al.)
          </a>
        </div>
        
        <p class="text-yellow-400/80 text-xs border-l-2 border-yellow-500/30 pl-3">
          <strong>Nota:</strong> Si pausas por más de 15 min, considera registrar la sesión. Las pausas largas rompen el flow.
        </p>
      </div>
    </div>
  </div>
</template>
