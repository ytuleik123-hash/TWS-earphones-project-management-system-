import { useState, useMemo, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'

// 前置关系类型
const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'FS', desc: '完成-开始' },
  { value: 'SS', label: 'SS', desc: '开始-开始' },
  { value: 'FF', label: 'FF', desc: '完成-完成' },
  { value: 'SF', label: 'SF', desc: '开始-完成' },
]

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return ''
  return date.toISOString().split('T')[0]
}

// 格式化日期显示
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return ''
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 添加天数到日期
const addDays = (dateStr, days) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return ''
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

// 计算两个日期之间的天数
const getDaysBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  if (isNaN(start) || isNaN(end)) return 0
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

// ========== 新项目计划页面组件 ==========
export default function ProjectPlanPage({ projectName, onBack, onSave }) {
  // 计划页面列表：默认第一个是里程碑节点
  const [planPages, setPlanPages] = useState(() => {
    const saved = localStorage.getItem(`project_plan_pages_${projectName}`)
    return saved ? JSON.parse(saved) : [{ id: 'milestone', name: '里程碑节点', type: 'milestone' }]
  })
  const [activePlanId, setActivePlanId] = useState('milestone')
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [saveHint, setSaveHint] = useState(false)

  // 甘特图计划任务数据
  const [ganttPlans, setGanttPlans] = useState(() => {
    const saved = localStorage.getItem(`project_gantt_plans_${projectName}`)
    return saved ? JSON.parse(saved) : {}
  })

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem(`project_plan_pages_${projectName}`, JSON.stringify(planPages))
  }, [planPages, projectName])

  useEffect(() => {
    localStorage.setItem(`project_gantt_plans_${projectName}`, JSON.stringify(ganttPlans))
  }, [ganttPlans, projectName])

  const activePlan = planPages.find(p => p.id === activePlanId)

  // 添加新的计划页面
  const addNewPlan = () => {
    if (!newPlanName.trim()) return
    const newId = `plan_${Date.now()}`
    const newPlan = { id: newId, name: newPlanName.trim(), type: 'gantt' }
    setPlanPages([...planPages, newPlan])
    setGanttPlans({ ...ganttPlans, [newId]: [] })
    setActivePlanId(newId)
    setNewPlanName('')
    setShowNewPlanModal(false)
  }

  // 删除计划页面
  const deletePlanPage = (planId) => {
    if (planId === 'milestone') return
    setPlanPages(planPages.filter(p => p.id !== planId))
    const newPlans = { ...ganttPlans }
    delete newPlans[planId]
    setGanttPlans(newPlans)
    if (activePlanId === planId) {
      setActivePlanId('milestone')
    }
  }

  // 获取或创建甘特图任务
  const getGanttTasks = (planId) => {
    return ganttPlans[planId] || []
  }

  // 更新甘特图任务
  const updateGanttTask = (planId, taskId, field, value) => {
    setGanttPlans(prev => {
      const tasks = [...(prev[planId] || [])]
      const idx = tasks.findIndex(t => t.id === taskId)
      if (idx >= 0) {
        const task = { ...tasks[idx], [field]: value }
        
        // 自动计算时间
        if (field === 'duration') {
          // 周期改变，重新计算完成时间
          const duration = parseInt(value) || 0
          if (duration > 0 && task.start) {
            task.end = addDays(task.start, duration)
          }
        } else if (field === 'end') {
          // 完成时间改变，重新计算周期
          if (task.start && value) {
            task.duration = getDaysBetween(task.start, value)
          }
        } else if (field === 'start') {
          // 开始时间改变，根据周期重新计算完成时间
          if (value && task.duration) {
            task.end = addDays(value, task.duration)
          }
        }
        
        tasks[idx] = task
      }
      return { ...prev, [planId]: tasks }
    })
  }

  // 添加任务
  const addGanttTask = (planId, parentId = null) => {
    setGanttPlans(prev => {
      const tasks = [...(prev[planId] || [])]
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: '新任务',
        start: formatDate(new Date()),
        end: formatDate(new Date(Date.now() + 86400000)),
        duration: 1,
        progress: 0,
        assignee: '',
        parentId: parentId,
        expanded: true,
        dependencies: [], // [{ taskId, type: 'FS', lag: 0 }]
      }
      return { ...prev, [planId]: [...tasks, newTask] }
    })
  }

  // 添加子任务
  const addSubTask = (planId, parentId) => {
    setGanttPlans(prev => {
      const tasks = [...(prev[planId] || [])]
      const parent = tasks.find(t => t.id === parentId)
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: '新子任务',
        start: parent?.start || formatDate(new Date()),
        end: parent?.end || formatDate(new Date(Date.now() + 86400000)),
        duration: parent?.duration || 1,
        progress: 0,
        assignee: '',
        parentId: parentId,
        expanded: true,
        dependencies: [],
      }
      return { ...prev, [planId]: [...tasks, newTask] }
    })
  }

  // 删除任务
  const deleteGanttTask = (planId, taskId) => {
    setGanttPlans(prev => {
      const tasks = (prev[planId] || []).filter(t => t.id !== taskId && t.parentId !== taskId)
      return { ...prev, [planId]: tasks }
    })
  }

  // 切换任务展开/折叠
  const toggleTaskExpanded = (planId, taskId) => {
    setGanttPlans(prev => {
      const tasks = [...(prev[planId] || [])]
      const idx = tasks.findIndex(t => t.id === taskId)
      if (idx >= 0) {
        tasks[idx] = { ...tasks[idx], expanded: !tasks[idx].expanded }
      }
      return { ...prev, [planId]: tasks }
    })
  }

  // 添加前置关系
  const addDependency = (planId, taskId, depTaskId, type = 'FS', lag = 0) => {
    setGanttPlans(prev => {
      const tasks = [...(prev[planId] || [])]
      const idx = tasks.findIndex(t => t.id === taskId)
      if (idx >= 0) {
        const deps = [...(tasks[idx].dependencies || [])]
        if (!deps.find(d => d.taskId === depTaskId)) {
          deps.push({ taskId: depTaskId, type, lag })
          tasks[idx] = { ...tasks[idx], dependencies: deps }
        }
      }
      return { ...prev, [planId]: tasks }
    })
  }

  // 删除前置关系
  const removeDependency = (planId, taskId, depTaskId) => {
    setGanttPlans(prev => {
      const tasks = [...(prev[planId] || [])]
      const idx = tasks.findIndex(t => t.id === taskId)
      if (idx >= 0) {
        const deps = (tasks[idx].dependencies || []).filter(d => d.taskId !== depTaskId)
        tasks[idx] = { ...tasks[idx], dependencies: deps }
      }
      return { ...prev, [planId]: tasks }
    })
  }

  // 导出Excel
  const exportToExcel = (planId) => {
    const tasks = getGanttTasks(planId)
    if (tasks.length === 0) {
      alert('没有可导出的任务')
      return
    }

    const data = tasks.map(task => ({
      '任务名称': task.name,
      '开始时间': task.start,
      '完成时间': task.end,
      '周期(天)': task.duration,
      '负责方': task.assignee || '',
      '进度(%)': task.progress || 0,
      '父任务ID': task.parentId || '',
      '前置任务': (task.dependencies || []).map(d => {
        const dep = tasks.find(t => t.id === d.taskId)
        return dep ? `${dep.name}(${d.type})` : ''
      }).join(', '),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX