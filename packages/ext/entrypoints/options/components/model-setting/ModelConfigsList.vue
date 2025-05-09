<script setup lang="ts">
import { t } from '@/src/utils/extension';
import Button from '@/src/components/ui/button/Button.vue'
import { onMounted, ref } from 'vue'
import { useModelConfigs, useModelConfigStorage } from '@/src/composables/model-config';
import { ModelConfigItem } from '@/src/types/config/model';
import { RouterLink, useRouter } from 'vue-router';
import { toast } from '@/src/components/ui/toast';
import { ArrowUpFromLine, ArrowDownFromLine, CircleX, LocateFixed, EditIcon, SquarePlusIcon, CopyPlusIcon } from 'lucide-vue-next'
import RadioButton from '@/src/components/custom-ui/RadioButton.vue';
import ModelConfigItemComponent from './ModelConfigItem.vue';
import Switch from '@/src/components/ui/switch/Switch.vue';
import useWxtStorage from '@/src/composables/useWxtStorage';

const { listItem, updateConfigOrder, setDefaultItemId, deleteItem, getDefaultItem } = useModelConfigStorage()
const { state: models } = useModelConfigs()
const { push } = useRouter()
const defaultModel = ref<ModelConfigItem | null>()
const {state:isEditMode} = useWxtStorage('local:config-model-list-is-edit-mode',false)
onMounted(async () => {
  defaultModel.value = await getDefaultItem()
})

const handleUp = (id: string) => {
  console.log(`Up button clicked for model with id ${id}`);
  updateConfigOrder(id, 'up')
};

const handleDown = (id: string) => {
  console.log(`Down button clicked for model with id ${id}`);
  updateConfigOrder(id, 'down')
};

const handleDelete = async (id: string) => {
  console.log(`delete button clicked for model with id ${id}`);
  const result = await deleteItem(id)
  if (result) {
    toast({
      title: `delete suc!`,
      variant: 'success',

    })
  } else {
    toast({
      title: `delete failed!`,
      variant: 'destructive'

    })
  }
};

const handleEdit = (id: string) => {
  console.log(`edit button clicked for model with id ${id}`);
  push(`/models/edit?id=${id}`)
}

const handleCopy = (id: string) => {
  console.log(`copy button clicked for model with id ${id}`);
  push(`/models/create?copy=${id}`)
}
const handleSelect = async (id: string) => {
  console.log(`select button clicked for model with id ${id}`);
  const rs = await setDefaultItemId(id)
  if (!rs) {
    toast({
      title: 'select default config failed!',
      variant: 'destructive'
    })
    return
  }
  defaultModel.value = models.value.find(p => p.id === id)
}

const handleLocate = (id: string | undefined) => {
  if (id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

</script>
<template>
  <div>
    <!-- create button   -->
    <div class="flex flex-row gap-2">

      <Button class="bg-green-600 hover:bg-green-800 pl-2">
        <RouterLink to="/models/create" class="flex items-center [&_svg]:size-6">
          <SquarePlusIcon class=""/>
          {{ t('Create') }}
        </RouterLink>
      </Button>
      <label class="flex flex-row items-center gap-2 font-light border p-1 text-sm rounded">
        <Switch v-model:checked="isEditMode" class="data-[state=checked]:bg-gray-500" />
        {{ t('Toggle_edit_mode') }}
      </label>
    </div>
    <!-- default -->
    <div class="min-h-16 text-2xl mt-4 flex flex-row items-center gap-2">
      {{ t('default') }}:
      <span class="border rounded p-1 border-green-500">
        {{ defaultModel?.name??'NO MODEL ' }}

      </span>
      <LocateFixed @click="handleLocate(defaultModel?.id)"
        class="h-8 w-8 text-green-500 border rounded-2xl p-1 hover:border-green-800" />

    </div>
    <!-- list -->
    <div class="relative w-[calc(100vw-16rem)]">
      <TransitionGroup name="list" tag="div" class="w-full flex flex-row flex-wrap items-stretch gap-8">
        <template v-for="model in models" :key="model.id">
          <div class="flex items-center gap-2 mb-4 w-fit min-w-96" :id="model.id">
            <RadioButton :checked="!!defaultModel && defaultModel.id === model.id" @click="handleSelect(model.id)" />
            <ModelConfigItemComponent :item="model" class="flex-1 self-stretch"
              :class="{ 'shadow-green-500 border-blue-500 ring-blue-500 bg-green-300/20 ring-2 shadow-2xl': !!defaultModel && defaultModel.id === model.id }" />
            <div class="flex flex-col justify-center gap-2" v-if="isEditMode">
              <Button @click="handleUp(model.id)">
                <ArrowUpFromLine />
              </Button>
              <!-- edit button -->
              <Button @click="handleEdit(model.id)" variant="outline" title="edit">
                <EditIcon />
              </Button>
              <Button @click="handleCopy(model.id)" variant="outline" title="copy">
                <CopyPlusIcon />
              </Button>
              <!-- delte button -->
              <Button @click="handleDelete(model.id)" variant="destructive" title="delete">
                <CircleX />
              </Button>
              <Button @click="handleDown(model.id)">
                <ArrowDownFromLine />
              </Button>
            </div>
          </div>
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
/* 对移动中的元素应用的过渡 */
.list-enter-active {
  transition: all 0.5 ease;
}

.list-move,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(10em);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
  position: absolute;
  /* max-width: 100%; */
}
</style>