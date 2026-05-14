import { useState, useMemo, Fragment, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Filter,
  Plus,
  X,
  Trash2,
  Save,
  FolderOpen,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ClipboardList,
  Calendar,
  Users,
  BookOpen,
  Download,
  Upload,
  Maximize2,
  Box,
  Layers,
  Hand,
  Headphones,
  Ruler,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'

// ========== 新项目计划页面组件 ==========
function ProjectPlanPage({ projectName, onBack, onSave }) {
  // 计划页面列表：默认第一个是里程碑节点
  const [planPages, setPlanPages] = useState([
    { id: 'milestone', name: '里程碑节点', type: 'milestone' }
  ])
  const [activePlanId, setActivePlanId] = useState('milestone')
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [saveHint, setSaveHint] = useState(false)

  // 甘特图计划任务数据
  const [ganttPlans, setGanttPlans] = useState({})

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
        
        // 智能计算时间
        if (field === 'duration') {
          // 周期改变，重新计算完成时间
          const duration = parseInt(value) || 0
          if (duration > 0 && task.start) {
            const start = new Date(task.start)
            const end = new Date(start.getTime() + duration * 86400000)
            task.end = end.toISOString().split('T')[0]
          }
        } else if (field === 'end') {
          // 完成时间改变，重新计算周期
          if (task.start && value) {
            const start = new Date(task.start)
            const end = new Date(value)
            task.duration = Math.ceil((end - start) / 86400000)
          }
        } else if (field === 'start') {
          // 开始时间改变，根据周期重新计算完成时间
          if (value && task.duration) {
            const start = new Date(value)
            const end = new Date(start.getTime() + task.duration * 86400000)
            task.end = end.toISOString().split('T')[0]
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
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 86400000)
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: '新任务',
        start: now.toISOString().split('T')[0],
        end: tomorrow.toISOString().split('T')[0],
        duration: 1,
        progress: 0,
        assignee: '',
        parentId: parentId,
        expanded: true,
        dependencies: [],
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
        start: parent?.start || new Date().toISOString().split('T')[0],
        end: parent?.end || new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
    setGanttPlans(prev => ({
      ...prev,
      [planId]: (prev[planId] || []).filter(t => t.id !== taskId && t.parentId !== taskId)
    }))
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

  // 导出Excel
  const exportGanttToExcel = (planId) => {
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
      '前置任务': (task.dependencies || []).map(d => d.taskId).join(','),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目计划')
    XLSX.writeFile(wb, `${projectName || '项目'}_计划_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // 导入Excel
  const importGanttFromExcel = (planId, file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        const importedTasks = jsonData.map((row, idx) => ({
          id: `task_${Date.now()}_${idx}`,
          name: row['任务名称'] || '未命名任务',
          start: row['开始时间'] || new Date().toISOString().split('T')[0],
          end: row['完成时间'] || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          duration: parseInt(row['周期(天)']) || 1,
          assignee: row['负责方'] || '',
          progress: parseInt(row['进度(%)']) || 0,
          parentId: row['父任务ID'] || null,
          expanded: true,
          dependencies: row['前置任务'] ? row['前置任务'].split(',').map(id => ({ taskId: id, type: 'FS' })) : [],
        }))

        setGanttPlans(prev => ({ ...prev, [planId]: importedTasks }))
        alert(`成功导入 ${importedTasks.length} 个任务`)
      } catch (err) {
        alert('导入失败：' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // 计算甘特图时间范围
  const getGanttRange = (tasks) => {
    if (!tasks || tasks.length === 0) return null
    const dates = tasks.filter(t => t.start).map(t => new Date(t.start))
    if (dates.length === 0) return null
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...tasks.filter(t => t.end).map(t => new Date(t.end))))
    
    // 扩展范围，前后各加几天
    const paddingDays = 7
    minDate.setDate(minDate.getDate() - paddingDays)
    maxDate.setDate(maxDate.getDate() + paddingDays)
    
    return { start: minDate, end: maxDate }
  }

  // 格式化日期显示
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date)) return ''
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 甘特图条形位置计算
  const getBarStyle = (task, range) => {
    if (!task.start || !range) return { display: 'none' }
    const start = new Date(task.start)
    const end = task.end ? new Date(task.end) : new Date(start.getTime() + 86400000)
    if (isNaN(start) || isNaN(end)) return { display: 'none' }
    
