import { useState, useMemo, Fragment, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'

// ========== 自定义 Hook：用于延迟保存的输入 ==========
function useDeferredInput(initialValue, onSave, delay = 0) {
  const [localValue, setLocalValue] = useState(initialValue)
  const inputRef = useRef(null)
  
  useEffect(() => {
    setLocalValue(initialValue)
  }, [initialValue])
  
  const handleChange = (e) => {
    setLocalValue(e.target.value)
  }
  
  const handleBlur = () => {
    if (localValue !== initialValue) {
      onSave(localValue)
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }
  
  return {
    value: localValue,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    ref: inputRef
  }
}
import {
  Package,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Filter,
  Plus,
  X,
  Trash2,
  Save,
  FolderOpen,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
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
  ExternalLink,
} from 'lucide-react'



  // 里程碑节点页面（原有功能）
  // 里程碑节点页面（独立组件）
  function MilestonePage({ initialMilestones, initialColumns, initialCells, initialComments, onMilestonesChange, onColumnsChange, onCellsChange, onCommentsChange }) {
    const [milestones, setMilestones] = useState(initialMilestones || [
      { id: 'pm_0', label: 'Kick off' },
      { id: 'pm_1', label: 'EV build' },
      { id: 'pm_2', label: 'Gate2' },
      { id: 'pm_3', label: 'Tooling start' },
      { id: 'pm_4', label: 'T0' },
      { id: 'pm_5', label: 'DV1 build' },
      { id: 'pm_6', label: 'DV2 build' },
      { id: 'pm_7', label: 'GATE 3' },
      { id: 'pm_8', label: 'PV build' },
      { id: 'pm_9', label: 'GATE 4' },
      { id: 'pm_10', label: 'SOP' },
      { id: 'pm_11', label: 'Initial Production' }
    ])
    const [columns, setColumns] = useState(initialColumns || [
      { id: 'pc_0', name: 'Original Plan' },
      { id: 'pc_1', name: 'Actual plan' }
    ])
    const [cells, setCells] = useState(initialCells || {})
    const [comments, setComments] = useState(initialComments || {})
    const [commentModal, setCommentModal] = useState(null)
    const [commentValue, setCommentValue] = useState('')

    const addMilestone = () => {
      const newMilestones = [...milestones, { id: `pm_${Date.now()}`, label: '新节点' }]
      setMilestones(newMilestones)
      if (onMilestonesChange) onMilestonesChange(newMilestones)
    }
    const addColumn = () => {
      const newColumns = [...columns, { id: `pc_${Date.now()}`, name: '新列' }]
      setColumns(newColumns)
      if (onColumnsChange) onColumnsChange(newColumns)
    }
    const updateMilestone = (id, label) => {
      const newMilestones = milestones.map(m => m.id === id ? { ...m, label } : m)
      setMilestones(newMilestones)
      if (onMilestonesChange) onMilestonesChange(newMilestones)
    }
    const updateColumn = (id, name) => {
      const newColumns = columns.map(c => c.id === id ? { ...c, name } : c)
      setColumns(newColumns)
      if (onColumnsChange) onColumnsChange(newColumns)
    }
    const deleteMilestone = (id) => {
      if (milestones.length <= 1) return
      const newMilestones = milestones.filter(m => m.id !== id)
      setMilestones(newMilestones)
      if (onMilestonesChange) onMilestonesChange(newMilestones)
    }
    const deleteColumn = (id) => {
      if (columns.length <= 1) return
      const newColumns = columns.filter(c => c.id !== id)
      setColumns(newColumns)
      if (onColumnsChange) onColumnsChange(newColumns)
    }
    const updateCell = (milestoneId, colId, value) => {
      const newCells = { ...cells, [`${milestoneId}_${colId}`]: value }
      setCells(newCells)
      if (onCellsChange) onCellsChange(newCells)
    }
    const updateComment = (milestoneId, value) => {
      const newComments = { ...comments, [milestoneId]: value }
      setComments(newComments)
      if (onCommentsChange) onCommentsChange(newComments)
    }

    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={addMilestone} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
            <Plus className="w-4 h-4" /> 新增行
          </button>
          <button onClick={addColumn} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
            <Plus className="w-4 h-4" /> 新增列
          </button>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[140px]">Key Milestones</th>
                  {columns.map((col) => (
                    <th key={col.id} className="text-left py-1.5 px-2 border border-slate-600 min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => updateColumn(col.id, e.target.value)}
                          onKeyDown={(e) => {
                            // 防止退格键触发浏览器返回
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                          }}
                          className="flex-1 min-w-0 bg-transparent text-white font-medium border-b border-slate-400 focus:outline-none focus:border-white px-1 py-0.5 text-xs"
                          placeholder="列名"
                        />
                        <button onClick={() => deleteColumn(col.id)} className="p-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-600 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[140px]">Comments</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-1.5 px-2 border border-slate-200 align-top">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => updateMilestone(m.id, e.target.value)}
                          onKeyDown={(e) => {
                            // 防止退格键触发浏览器返回
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                          }}
                          className="flex-1 min-w-0 rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="节点名称"
                        />
                        <button onClick={() => deleteMilestone(m.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td key={col.id} className="py-1.5 px-2 border border-slate-200 align-top">
                        <input
                          type="date"
                          value={cells[`${m.id}_${col.id}`] || ''}
                          onChange={(e) => updateCell(m.id, col.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="选择日期"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-2 border border-slate-200 align-top">
                      <button
                        onClick={() => { setCommentModal(m.id); setCommentValue(comments[m.id] || '') }}
                        className="w-full text-left rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs hover:bg-slate-50 truncate"
                        title="点击查看/编辑备注"
                      >
                        {comments[m.id] || <span className="text-slate-400">点击添加备注</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 里程碑节点备注编辑弹窗 */}
        {commentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setCommentModal(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800">备注 — {milestones.find(m => m.id === commentModal)?.label || '节点'}</h2>
                <button type="button" onClick={() => setCommentModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <textarea
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                className="flex-1 min-h-[200px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="输入备注描述..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setCommentModal(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</button>
                <button
                  type="button"
                  onClick={() => { updateComment(commentModal, commentValue); setCommentModal(null) }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

// ========== 新项目计划页面组件 ==========
function ProjectPlanPage({ projectName, onBack, onSave, planPages: initialPlanPages, ganttPlans: initialGanttPlans, onPlanPagesChange, onGanttPlansChange, initialMilestones, initialColumns, initialCells, initialComments, onMilestonesChange, onColumnsChange, onCellsChange, onCommentsChange }) {
  // 计划页面列表：默认第一个是里程碑节点
  const [planPages, setPlanPages] = useState(initialPlanPages || [
    { id: 'milestone', name: '里程碑节点', type: 'milestone' }
  ])
  const [activePlanId, setActivePlanId] = useState('milestone')
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [saveHint, setSaveHint] = useState(false)
  
  // 编辑计划页面名称的状态
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [editingPlanName, setEditingPlanName] = useState('')

  // 甘特图计划任务数据
  const [ganttPlans, setGanttPlans] = useState(initialGanttPlans || {})


  const activePlan = planPages.find(p => p.id === activePlanId)

  // 添加新的计划页面
  const addNewPlan = () => {
    if (!newPlanName.trim()) return
    const newId = `plan_${Date.now()}`
    const newPlan = { id: newId, name: newPlanName.trim(), type: 'gantt' }
    const newPlanPages = [...planPages, newPlan]
    const newGanttPlans = { ...ganttPlans, [newId]: [] }
    setPlanPages(newPlanPages)
    setGanttPlans(newGanttPlans)
    setActivePlanId(newId)
    setNewPlanName('')
    setShowNewPlanModal(false)
    // 通知父组件状态变化
    if (onPlanPagesChange) onPlanPagesChange(newPlanPages)
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 静默保存到父组件（不显示提示）
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 删除计划页面
  const deletePlanPage = (planId) => {
    if (planId === 'milestone') return
    const newPlanPages = planPages.filter(p => p.id !== planId)
    const newPlans = { ...ganttPlans }
    delete newPlans[planId]
    setPlanPages(newPlanPages)
    setGanttPlans(newPlans)
    if (activePlanId === planId) {
      setActivePlanId('milestone')
    }
    // 通知父组件状态变化
    if (onPlanPagesChange) onPlanPagesChange(newPlanPages)
    if (onGanttPlansChange) onGanttPlansChange(newPlans)
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }
  
  // 更新计划页面名称
  const updatePlanName = (planId, newName) => {
    if (!newName.trim()) return
    const newPlanPages = planPages.map(p => 
      p.id === planId ? { ...p, name: newName.trim() } : p
    )
    setPlanPages(newPlanPages)
    if (onPlanPagesChange) onPlanPagesChange(newPlanPages)
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }
  
  // 开始编辑计划名称
  const startEditingPlanName = (plan) => {
    setEditingPlanId(plan.id)
    setEditingPlanName(plan.name)
  }
  
  // 保存编辑的计划名称
  const saveEditingPlanName = () => {
    if (editingPlanId && editingPlanName.trim()) {
      updatePlanName(editingPlanId, editingPlanName)
    }
    setEditingPlanId(null)
    setEditingPlanName('')
  }
  
  // 取消编辑计划名称
  const cancelEditingPlanName = () => {
    setEditingPlanId(null)
    setEditingPlanName('')
  }

  // 获取或创建甘特图任务
  const getGanttTasks = (planId) => {
    return ganttPlans[planId] || []
  }

  // 更新甘特图任务
  const updateGanttTask = (planId, taskId, field, value) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
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
          task.duration = Math.max(1, Math.ceil((end - start) / 86400000))
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
      newGanttPlans[planId] = tasks
      setGanttPlans(newGanttPlans)
      // 通知父组件状态变化
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    }
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 添加任务
  const addGanttTask = (planId, parentId = null) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
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
    newGanttPlans[planId] = [...tasks, newTask]
    setGanttPlans(newGanttPlans)
    // 通知父组件状态变化
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 自动保存
    setTimeout(() => {
      onSave()
    }, 0)
  }

  // 添加子任务
  const addSubTask = (planId, parentId) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
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
    newGanttPlans[planId] = [...tasks, newTask]
    setGanttPlans(newGanttPlans)
    // 通知父组件状态变化
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 切换任务展开/折叠
  const toggleTaskExpanded = (planId, taskId) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], expanded: !tasks[idx].expanded }
      newGanttPlans[planId] = tasks
      setGanttPlans(newGanttPlans)
      // 通知父组件状态变化
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    }
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 解析依赖字符串 (如 "FS-2", "SS+3", "3", "FS")
  const parseDependency = (depStr) => {
    if (!depStr) return null
    depStr = depStr.trim().toUpperCase()
    
    // 匹配模式: FS-2, SS+3, FF-1, SF+5, 或只有数字
    const match = depStr.match(/^(FS|SS|FF|SF)?([+-]?\d+)?$/)
    if (!match) return null
    
    const type = match[1] || 'FS' // 默认FS
    const lag = parseInt(match[2] || '0')
    
    return { type, lag }
  }

  // 格式化依赖显示
  const formatDependency = (dep) => {
    if (!dep) return ''
    if (dep.lag === 0) return dep.type
    if (dep.lag > 0) return `${dep.type}+${dep.lag}`
    return `${dep.type}${dep.lag}`
  }

  // 根据依赖关系计算任务时间
  const calculateTaskFromDependency = (task, predecessor, depStr) => {
    const dep = parseDependency(depStr)
    if (!dep || !predecessor || !predecessor.start || !predecessor.end) return null
    
    const predStart = new Date(predecessor.start)
    const predEnd = new Date(predecessor.end)
    let newStart, newEnd
    
    switch (dep.type) {
      case 'FS': // 完成-开始: 前置任务完成后开始
        newStart = new Date(predEnd.getTime() + dep.lag * 86400000)
        newEnd = new Date(newStart.getTime() + task.duration * 86400000)
        break
      case 'SS': // 开始-开始: 前置任务开始后开始
        newStart = new Date(predStart.getTime() + dep.lag * 86400000)
        newEnd = new Date(newStart.getTime() + task.duration * 86400000)
        break
      case 'FF': // 完成-完成: 前置任务完成后完成
        newEnd = new Date(predEnd.getTime() + dep.lag * 86400000)
        newStart = new Date(newEnd.getTime() - task.duration * 86400000)
        break
      case 'SF': // 开始-完成: 前置任务开始后完成
        newEnd = new Date(predStart.getTime() + dep.lag * 86400000)
        newStart = new Date(newEnd.getTime() - task.duration * 86400000)
        break
      default:
        return null
    }
    
    return {
      start: newStart.toISOString().split('T')[0],
      end: newEnd.toISOString().split('T')[0]
    }
  }

  // 更新任务依赖
  const updateTaskDependency = (planId, taskId, depTaskId, depStr) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
    const taskIdx = tasks.findIndex(t => t.id === taskId)
    const depTask = tasks.find(t => t.id === depTaskId)
    
    if (taskIdx >= 0 && depTask) {
      const task = { ...tasks[taskIdx] }
      const deps = [...(task.dependencies || [])]
      const depIdx = deps.findIndex(d => d.taskId === depTaskId)
      
      const dep = parseDependency(depStr)
      if (dep) {
        if (depIdx >= 0) {
          deps[depIdx] = { taskId: depTaskId, type: dep.type, lag: dep.lag }
        } else {
          deps.push({ taskId: depTaskId, type: dep.type, lag: dep.lag })
        }
        
        // 根据依赖重新计算时间
        const newTimes = calculateTaskFromDependency(task, depTask, depStr)
        if (newTimes) {
          task.start = newTimes.start
          task.end = newTimes.end
        }
      } else if (depIdx >= 0) {
        deps.splice(depIdx, 1)
      }
      
      task.dependencies = deps
      tasks[taskIdx] = task
      newGanttPlans[planId] = tasks
      setGanttPlans(newGanttPlans)
      // 通知父组件状态变化
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    }
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 删除任务（同时删除子任务）
  const deleteGanttTask = (planId, taskId) => {
    const newGanttPlans = {
      ...ganttPlans,
      [planId]: (ganttPlans[planId] || []).filter(t => t.id !== taskId && t.parentId !== taskId)
    }
    setGanttPlans(newGanttPlans)
    // 通知父组件状态变化
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 静默保存
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 移动任务顺序
  const moveGanttTaskUp = (planId, taskId) => {
    const tasks = [...(ganttPlans[planId] || [])]
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx > 0) {
      [tasks[idx], tasks[idx - 1]] = [tasks[idx - 1], tasks[idx]]
      const newGanttPlans = { ...ganttPlans, [planId]: tasks }
      setGanttPlans(newGanttPlans)
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
      setTimeout(() => { if (onSave) onSave({ silent: true }) }, 0)
    }
  }

  const moveGanttTaskDown = (planId, taskId) => {
    const tasks = [...(ganttPlans[planId] || [])]
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx >= 0 && idx < tasks.length - 1) {
      [tasks[idx], tasks[idx + 1]] = [tasks[idx + 1], tasks[idx]]
      const newGanttPlans = { ...ganttPlans, [planId]: tasks }
      setGanttPlans(newGanttPlans)
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
      setTimeout(() => { if (onSave) onSave({ silent: true }) }, 0)
    }
  }

  // 计算甘特图时间范围（增加前后padding）
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

  // 生成时间轴刻度
  const generateTimeScale = (range, maxTicks = 15) => {
    if (!range) return []
    const days = Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24))
    const interval = Math.max(1, Math.ceil(days / maxTicks))
    const ticks = []
    
    for (let i = 0; i <= days; i += interval) {
      const date = new Date(range.start)
      date.setDate(date.getDate() + i)
      ticks.push({
        date,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        position: (i / days) * 100
      })
    }
    return ticks
  }

  // 甘特图条形位置计算
  const getBarStyle = (task, range) => {
    if (!task.start || !range) return { display: 'none' }
    const start = new Date(task.start)
    const end = task.end ? new Date(task.end) : new Date(start.getTime() + 86400000)
    if (isNaN(start) || isNaN(end)) return { display: 'none' }
    
    const totalDays = Math.max(1, Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24)))
    const offsetDays = Math.ceil((start - range.start) / (1000 * 60 * 60 * 24))
    const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    
    const left = (offsetDays / totalDays) * 100
    const width = (duration / totalDays) * 100
    
    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(2, width)}%`
    }
  }

  // 任务名称编辑器组件（使用本地状态避免输入时重新渲染）
  const TaskNameEditor = ({ task, planId, updateGanttTask }) => {
    const [localName, setLocalName] = useState(task.name)
    const [isEditing, setIsEditing] = useState(false)
    const inputRef = useRef(null)
    
    useEffect(() => {
      setLocalName(task.name)
    }, [task.name])
    
    const handleSave = () => {
      if (localName !== task.name) {
        updateGanttTask(planId, task.id, 'name', localName)
      }
      setIsEditing(false)
    }
    
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        setLocalName(task.name)
        setIsEditing(false)
      }
    }
    
    if (!isEditing) {
      return (
        <div 
          onClick={() => {
            setIsEditing(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="w-full rounded border border-transparent hover:border-slate-300 px-1.5 py-1 text-slate-800 text-xs cursor-pointer truncate"
          title={task.name}
        >
          {task.name || <span className="text-slate-400">点击输入任务名称</span>}
        </div>
      )
    }
    
    return (
      <input
        ref={inputRef}
        type="text"
        value={localName}
        onChange={(e) => setLocalName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full rounded border border-blue-500 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="任务名称"
      />
    )
  }

  // 依赖关系编辑器组件
  const DependencyEditor = ({ task, tasks, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [depTaskId, setDepTaskId] = useState(task.dependencies?.[0]?.taskId || '')
    const [depType, setDepType] = useState(task.dependencies?.[0]?.type || 'FS')
    const [depLag, setDepLag] = useState(task.dependencies?.[0]?.lag || 0)
    
    const availableTasks = tasks.filter(t => t.id !== task.id && !t.parentId)
    
    const handleSave = () => {
      if (depTaskId) {
        const lagStr = depLag > 0 ? `+${depLag}` : depLag < 0 ? `${depLag}` : ''
        onUpdate(depTaskId, `${depType}${lagStr}`)
      } else {
        onUpdate(null, '')
      }
      setIsEditing(false)
    }
    
    const handleClear = () => {
      setDepTaskId('')
      setDepType('FS')
      setDepLag(0)
      onUpdate(null, '')
      setIsEditing(false)
    }
    
    if (!isEditing) {
      const dep = task.dependencies?.[0]
      if (!dep) return <span className="text-slate-400 text-xs cursor-pointer" onClick={() => setIsEditing(true)}>点击设置</span>
      const depTask = tasks.find(t => t.id === dep.taskId)
      const lagStr = dep.lag > 0 ? `+${dep.lag}` : dep.lag < 0 ? dep.lag : ''
      return (
        <div className="cursor-pointer text-xs" onClick={() => setIsEditing(true)}>
          <span className="text-blue-600 font-medium">{depTask?.name || '未知'}</span>
          <span className="text-slate-500 ml-1">({dep.type}{lagStr})</span>
        </div>
      )
    }
    
    return (
      <div className="space-y-1">
        <select
          value={depTaskId}
          onChange={(e) => setDepTaskId(e.target.value)}
          className="w-full rounded border border-slate-300 px-1 py-0.5 text-slate-800 text-[10px]"
        >
          <option value="">无前置</option>
          {availableTasks.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {depTaskId && (
          <div className="flex gap-1">
            <select
              value={depType}
              onChange={(e) => setDepType(e.target.value)}
              className="flex-1 rounded border border-slate-300 px-1 py-0.5 text-slate-800 text-[10px]"
            >
              <option value="FS">FS</option>
              <option value="SS">SS</option>
              <option value="FF">FF</option>
              <option value="SF">SF</option>
            </select>
            <input
              type="number"
              value={depLag}
              onChange={(e) => setDepLag(parseInt(e.target.value) || 0)}
              className="w-12 rounded border border-slate-300 px-1 py-0.5 text-slate-800 text-[10px] text-center"
              placeholder="偏移"
            />
          </div>
        )}
        <div className="flex gap-1">
          <button onClick={handleSave} className="flex-1 bg-blue-500 text-white text-[10px] py-0.5 rounded">确定</button>
          <button onClick={handleClear} className="flex-1 bg-slate-300 text-slate-700 text-[10px] py-0.5 rounded">清除</button>
        </div>
      </div>
    )
  }



  // 导出甘特图到Excel
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
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目计划')
    XLSX.writeFile(wb, `${projectName || '项目'}_计划_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // 导入甘特图从Excel
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
          dependencies: [],
        }))

        setGanttPlans(prev => ({ ...prev, [planId]: importedTasks }))
        alert(`成功导入 ${importedTasks.length} 个任务`)
      } catch (err) {
        alert('导入失败：' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // 甘特图任务名称输入组件（使用本地状态延迟保存）
  const GanttTaskNameInput = ({ planId, task }) => {
    const { value, onChange, onBlur, onKeyDown } = useDeferredInput(
      task.name,
      (newValue) => updateGanttTask(planId, task.id, 'name', newValue)
    )
    
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="任务名称"
      />
    )
  }

  // 甘特图页面
  const GanttPage = ({ planId }) => {
    const tasks = getGanttTasks(planId)
    const range = getGanttRange(tasks)
    const timeScale = generateTimeScale(range)
    const fileInputRef = useRef(null)
    
    // 本地状态用于任务名称输入
    const [editingTaskNames, setEditingTaskNames] = useState({})
    
    // 处理任务名称输入变化（仅更新本地状态）
    const handleTaskNameChange = (taskId, value) => {
      setEditingTaskNames(prev => ({ ...prev, [taskId]: value }))
    }
    
    // 处理任务名称输入失去焦点或回车时保存
    const handleTaskNameSave = (taskId) => {
      const newValue = editingTaskNames[taskId]
      if (newValue !== undefined && newValue !== tasks.find(t => t.id === taskId)?.name) {
        updateGanttTask(planId, taskId, 'name', newValue)
      }
      setEditingTaskNames(prev => {
        const next = { ...prev }
        delete next[taskId]
        return next
      })
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button 
            onClick={() => addGanttTask(planId)} 
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" /> 新增任务
          </button>
          <button 
            onClick={() => exportGanttToExcel(planId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" /> 导出Excel
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" /> 导入Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                importGanttFromExcel(planId, e.target.files[0])
                e.target.value = ''
              }
            }}
          />
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-700 text-white">
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[40px] sticky left-0 bg-slate-700 z-20">展开</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[180px] sticky left-[40px] bg-slate-700 z-20">任务名称</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[100px]">开始时间</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[100px]">完成时间</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[65px]">周期</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[90px]">负责方</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[120px]">前置节点</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[70px]">操作</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[500px]">
                    <div className="flex items-center justify-between">
                      <span>甘特图</span>
                      {timeScale.length > 0 && (
                        <div className="flex-1 mx-4 relative h-6">
                          {timeScale.map((tick, i) => (
                            <div
                              key={i}
                              className="absolute top-0 text-[10px] text-white/80"
                              style={{ left: `${tick.position}%`, transform: 'translateX(-50%)' }}
                            >
                              {tick.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.filter(t => !t.parentId || tasks.find(pt => pt.id === t.parentId)?.expanded).map((task) => {
                  const hasChildren = tasks.some(t => t.parentId === task.id)
                  const level = task.parentId ? 1 : 0
                  return (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-1.5 px-2 border border-slate-200 sticky left-0 bg-white z-10">
                        {hasChildren && (
                          <button
                            onClick={() => toggleTaskExpanded(planId, task.id)}
                            className="p-0.5 rounded hover:bg-slate-200"
                          >
                            {task.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200 sticky left-[40px] bg-white z-10" style={{ paddingLeft: `${8 + level * 20}px` }}>
                        <TaskNameEditor 
                          task={task} 
                          planId={planId} 
                          updateGanttTask={updateGanttTask}
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <input
                          type="date"
                          value={task.start}
                          onChange={(e) => updateGanttTask(planId, task.id, 'start', e.target.value)}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <input
                          type="date"
                          value={task.end}
                          onChange={(e) => updateGanttTask(planId, task.id, 'end', e.target.value)}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <input
                          type="number"
                          min="1"
                          value={task.duration || ''}
                          onChange={(e) => updateGanttTask(planId, task.id, 'duration', parseInt(e.target.value) || 0)}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="天数"
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <input
                          type="text"
                          value={task.assignee || ''}
                          onChange={(e) => updateGanttTask(planId, task.id, 'assignee', e.target.value)}
                          onKeyDown={(e) => {
                            // 防止退格键触发浏览器返回
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                          }}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="负责方"
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <DependencyEditor 
                          task={task}
                          tasks={tasks}
                          onUpdate={(depTaskId, depStr) => updateTaskDependency(planId, task.id, depTaskId, depStr)}
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveGanttTaskUp(planId, task.id)}
                            disabled={tasks.findIndex(t => t.id === task.id) <= 0}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="上移"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveGanttTaskDown(planId, task.id)}
                            disabled={tasks.findIndex(t => t.id === task.id) >= tasks.length - 1}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="下移"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => addSubTask(planId, task.id)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="添加子任务"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteGanttTask(planId, task.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <div className="relative h-8 bg-slate-50 rounded overflow-hidden">
                          {/* 时间刻度背景 */}
                          {timeScale.map((tick, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 border-l border-slate-200"
                              style={{ left: `${tick.position}%` }}
                            />
                          ))}
                          {/* 任务条 */}
                          {range && task.start && (
                            <div
                              className="absolute top-1.5 h-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded shadow-sm flex items-center justify-center text-white text-[10px] font-medium"
                              style={getBarStyle(task, range)}
                              title={`${task.name}: ${task.start} 至 ${task.end} (${task.duration}天)`}
                            >
                              {task.duration >= 3 ? `${task.duration}天` : ''}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 && (
            <div className="py-12 text-center text-slate-500">暂无任务，点击「新增任务」添加</div>
          )}
        </div>
        
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            返回物料追踪
          </button>
          <h2 className="text-base font-semibold text-slate-800">{projectName || '未命名项目'} · 项目计划</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onSave(); setSaveHint(true); setTimeout(() => setSaveHint(false), 2000) }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
      
      {saveHint && (
        <p className="text-sm text-emerald-600 mb-4">已保存，数据已更新</p>
      )}

      {/* 计划页面切换标签 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {planPages.map((plan) => (
          <div
            key={plan.id}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activePlanId === plan.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {editingPlanId === plan.id ? (
              // 编辑模式
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editingPlanName}
                  onChange={(e) => setEditingPlanName(e.target.value)}
                  onBlur={saveEditingPlanName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEditingPlanName()
                    } else if (e.key === 'Escape') {
                      cancelEditingPlanName()
                    }
                  }}
                  className={`w-24 px-1.5 py-0.5 text-sm rounded border focus:outline-none focus:ring-1 ${
                    activePlanId === plan.id
                      ? 'bg-white text-slate-800 border-white focus:ring-white'
                      : 'bg-white text-slate-800 border-slate-300 focus:ring-blue-500'
                  }`}
                  autoFocus
                />
              </div>
            ) : (
              // 显示模式
              <>
                <button
                  onClick={() => setActivePlanId(plan.id)}
                  className="flex-1"
                >
                  {plan.name}
                </button>
                {plan.id !== 'milestone' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingPlanName(plan)
                      }}
                      className="ml-1 p-0.5 rounded hover:bg-white/20 text-current opacity-70 hover:opacity-100"
                      title="编辑名称"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`确定要删除计划页面"${plan.name}"吗？此操作不可恢复。`)) {
                          deletePlanPage(plan.id)
                        }
                      }}
                      className="ml-1 p-0.5 rounded hover:bg-white/20 text-current opacity-70 hover:opacity-100"
                      title="删除此计划页面"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          title="新建计划页面"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 根据当前选中页面显示不同内容 */}
      {activePlanId === 'milestone' ? (
        <MilestonePage
              initialMilestones={initialMilestones}
              initialColumns={initialColumns}
              initialCells={initialCells}
              initialComments={initialComments}
              onMilestonesChange={onMilestonesChange}
              onColumnsChange={onColumnsChange}
              onCellsChange={onCellsChange}
              onCommentsChange={onCommentsChange}
            />
      ) : (
        <GanttPage planId={activePlanId} />
      )}

      {/* 新建计划页面模态框 */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">新建计划页面</h3>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="输入计划页面名称"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowNewPlanModal(false); setNewPlanName('') }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={addNewPlan}
                disabled={!newPlanName.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

const VERSIONS = ['通用', 'Replaceable', 'Non-replaceable']
const UNITS = ['套', 'pcs']
const RISK_LEVELS = ['无', '低', '中', '高']
const PHASES = ['EV', 'DV1', 'DV2', 'PV']
const DISTRIBUTION_STAGES = ['EV', 'DV1', 'DV2', 'PV'] // 样机分发登记清单阶段
const PRODUCT_VERSIONS = ['Replaceable', 'Non-replaceable']
// 样机需求表格行（含客户实际需求分 Replaceable/Non-replaceable），顺序可调
const DEFAULT_TABLE_ROW_ORDER = ['Replaceable', 'Non-replaceable', '客户实际需求-Replaceable', '客户实际需求-Non-replaceable']
const STATUS_LABELS = {
  none: '未交货',
  partial: '部分交货',
  full: '已齐套',
}

// ---------- 初始 Mock 数据（零件不区分颜色，颜色为产品整机颜色；使用版本默认通用）---------
function getInitialMaterials() {
  const now = new Date()
  const fmt = (d) => d.toISOString().slice(0, 10)
  const addDays = (days) => new Date(now.getTime() + days * 86400000)

  return [
    { id: '1', name: '喇叭', version: '通用', phase: 'DV1', supplier: '瑞声科技', unit: '套', riskLevel: '无', remark: '', arrivalTime: '', requiredQty: 500, leadTimeDays: 20, demandConfirmDate: fmt(addDays(-15)), eta: fmt(addDays(5)), releaseDate: fmt(addDays(-15)), materialReadyTime: '' },
    { id: '2', name: '喇叭', version: '通用', phase: 'DV1', supplier: '瑞声科技', unit: '套', riskLevel: '低', remark: '', arrivalTime: fmt(addDays(3)), requiredQty: 500, leadTimeDays: 15, demandConfirmDate: fmt(addDays(-5)), eta: fmt(addDays(10)), releaseDate: fmt(addDays(-5)), materialReadyTime: '' },
    { id: '3', name: '喇叭', version: '通用', phase: 'DV2', supplier: '瑞声科技', unit: '套', riskLevel: '中', remark: '', arrivalTime: '', requiredQty: 300, leadTimeDays: 25, demandConfirmDate: fmt(addDays(-5)), eta: fmt(addDays(20)), releaseDate: fmt(addDays(-5)), materialReadyTime: '' },
    { id: '4', name: '喇叭', version: '通用', phase: 'DV2', supplier: '瑞声科技', unit: '套', riskLevel: '无', remark: '', arrivalTime: fmt(addDays(12)), requiredQty: 300, leadTimeDays: 10, demandConfirmDate: fmt(addDays(5)), eta: fmt(addDays(15)), releaseDate: fmt(addDays(5)), materialReadyTime: '' },
    { id: '5', name: '耳机主板 (Buds PCBA)', version: 'Replaceable', phase: 'DV1', supplier: '立讯精密', unit: '套', riskLevel: '无', remark: '', arrivalTime: fmt(addDays(-2)), requiredQty: 800, leadTimeDays: 30, demandConfirmDate: fmt(addDays(-32)), eta: fmt(addDays(-2)), releaseDate: fmt(addDays(-32)), materialReadyTime: '' },
    { id: '6', name: '耳机主板 (Buds PCBA)', version: 'Non-replaceable', phase: 'DV1', supplier: '立讯精密', unit: '套', riskLevel: '低', remark: '', arrivalTime: '', requiredQty: 600, leadTimeDays: 20, demandConfirmDate: fmt(addDays(-13)), eta: fmt(addDays(7)), releaseDate: fmt(addDays(-13)), materialReadyTime: '' },
    { id: '7', name: '充电盒主板 (Case PCBA)', version: '通用', phase: 'DV1', supplier: '比亚迪电子', unit: '套', riskLevel: '无', remark: '', arrivalTime: fmt(addDays(0)), requiredQty: 1000, leadTimeDays: 10, demandConfirmDate: fmt(addDays(-10)), eta: fmt(addDays(0)), releaseDate: fmt(addDays(-10)), materialReadyTime: '' },
    { id: '8', name: 'FPC', version: 'Replaceable', phase: 'DV2', supplier: '景旺电子', unit: '套', riskLevel: '中', remark: '', arrivalTime: '', requiredQty: 800, leadTimeDays: 12, demandConfirmDate: fmt(addDays(0)), eta: fmt(addDays(12)), releaseDate: fmt(addDays(-12)), materialReadyTime: '' },
    { id: '9', name: 'FPC', version: 'Non-replaceable', phase: 'DV2', supplier: '景旺电子', unit: '套', riskLevel: '高', remark: '', arrivalTime: '', requiredQty: 600, leadTimeDays: 20, demandConfirmDate: fmt(addDays(5)), eta: fmt(addDays(25)), releaseDate: fmt(addDays(-15)), materialReadyTime: '' },
    { id: '10', name: '耳机电池', version: 'Replaceable', phase: 'DV2', supplier: '赣锋锂业', unit: '套', riskLevel: '无', remark: '', arrivalTime: fmt(addDays(2)), requiredQty: 800, leadTimeDays: 1, demandConfirmDate: fmt(addDays(2)), eta: fmt(addDays(3)), releaseDate: fmt(addDays(2)), materialReadyTime: '' },
    { id: '11', name: '耳机电池', version: 'Non-replaceable', phase: 'PV', supplier: '赣锋锂业', unit: '套', riskLevel: '低', remark: '', arrivalTime: '', requiredQty: 600, leadTimeDays: 10, demandConfirmDate: fmt(addDays(-2)), eta: fmt(addDays(8)), releaseDate: fmt(addDays(-12)), materialReadyTime: '' },
    { id: '12', name: '充电盒电池', version: '通用', phase: 'PV', supplier: '欣旺达', unit: '套', riskLevel: '无', remark: '', arrivalTime: '', requiredQty: 1000, leadTimeDays: 15, demandConfirmDate: fmt(addDays(-9)), eta: fmt(addDays(6)), releaseDate: fmt(addDays(-24)), materialReadyTime: '' },
    { id: '13', name: '天线', version: 'Replaceable', phase: 'PV', supplier: '信维通信', unit: '套', riskLevel: '中', remark: '', arrivalTime: '', requiredQty: 800, leadTimeDays: 10, demandConfirmDate: fmt(addDays(-6)), eta: fmt(addDays(4)), releaseDate: fmt(addDays(-16)), materialReadyTime: '' },
    { id: '14', name: '天线', version: 'Non-replaceable', phase: 'PV', supplier: '信维通信', unit: '套', riskLevel: '无', remark: '', arrivalTime: fmt(addDays(0)), requiredQty: 600, leadTimeDays: 1, demandConfirmDate: fmt(addDays(0)), eta: fmt(addDays(1)), releaseDate: fmt(addDays(-1)), materialReadyTime: '' },
  ]
}

// 样机需求统计：耳机/充电盒 × 可拆/不可拆，每版本每颜色：投产、实际需求、客户样机、试产良率
const DEMAND_VERSION_KEYS = ['耳机可拆', '耳机不可拆', '充电盒可拆', '充电盒不可拆']
const DEMAND_VERSION_LABELS = { '耳机可拆': '耳机-可拆', '耳机不可拆': '耳机-不可拆', '充电盒可拆': '充电盒-可拆', '充电盒不可拆': '充电盒-不可拆' }

function getInitialProductDemands() {
  const colors = ['黑色', '白色', '蓝色', '绿色']
  const o = {}
  PHASES.forEach((phase) => {
    o[phase] = {}
    DEMAND_VERSION_KEYS.forEach((ver) => {
      o[phase][ver] = {}
      colors.forEach((c) => {
        const putIn = phase === 'DV1' ? (c === '黑色' || c === '白色' ? 200 : 100) : phase === 'DV2' ? 150 : 100
        const actual = phase === 'DV1' ? 120 : phase === 'DV2' ? 80 : 50
        o[phase][ver][c] = { putInQty: putIn, structurePutInQty: 0, actualDemand: actual, customerSample: 0 }
      })
    })
  })
  return o
}

const STORAGE_KEY = 'tws-material-tracker-projects'
const STORAGE_KEY_BACKUP = 'tws-material-tracker-projects-backup'

// 项目计划默认节点（Key Milestones）
const DEFAULT_PLAN_MILESTONES = [
  'Kick off', 'EV build', 'Gate2', 'Tooling start', 'T0', 'DV1 build', 'DV2 build', 'GATE 3', 'PV build', 'GATE 4', 'SOP (Start of Production)', 'Initial Production',
]
const DEFAULT_PLAN_COLUMNS = ['Original Plan', 'Actual plan']

// 关键物料阶段试产时间区间（可拆 / 不可拆 × 4 项）
const PHASE_START_RANGE_LABELS = ['喇叭试产', '耳机前加工+首件', '耳机DV1批量试产', 'H客户看拉']
function getDefaultPhaseStartRanges() {
  const empty = () => PHASE_START_RANGE_LABELS.map(() => ({ start: '', end: '' }))
  return { 可拆: empty(), 不可拆: empty() }
}

// 项目技术储备模块
const TECH_MODULES = ['声学', '结构', '电子', '软件', '模具', '业务']
function getDefaultTechReserve() {
  return TECH_MODULES.reduce((acc, m) => ({ ...acc, [m]: [] }), {})
}

// Workbook 问题记录分类
const WORKBOOK_CATEGORIES = ['Schedule', 'ID/ME', 'Acoustic/Call Quality', 'EE', 'SW', 'Compliance']

// 产品规格：产品类型、蓝牙版本、防水等级等选项
const PRODUCT_TYPES = ['TWS 入耳式', 'TWS 半入耳式', 'TWS 头戴式', '颈挂式', '骨传导', '其他']
const BLUETOOTH_VERSIONS = ['蓝牙 5.0', '蓝牙 5.1', '蓝牙 5.2', '蓝牙 5.3', '蓝牙 5.4', '其他']
const WATERPROOF_LEVELS = ['无', 'IPX4', 'IPX5', 'IPX6', 'IPX7', 'IP54', 'IP55', '其他']
const VERSION_STRATEGIES = ['标准版（电池不可拆卸）', '可持续版（电池可拆卸）', '双版本可选']
const TOUCH_CONTROLS = ['电容式触控', '压力感应', '电容式 + 压力感应可选']
const WEAR_DETECTIONS = ['红外 (IR)', '电容式', '红外 + 电容式']
const YES_NO = ['是', '否']
const DRIVER_TYPES = ['大喇叭 (Large Horn)', '动圈', '动铁', '圈铁', '其他']
const AUDIO_CODECS = ['SBC', 'AAC', 'SBC + AAC', 'SBC + AAC + LE Audio (LC3)', '其他']

function getDefaultProductSpec() {
  return {
    productType: '',
    chipModel: '',
    earbudBattery: '',
    caseBattery: '',
    bluetoothVersion: '',
    waterproof: '',
    playbackTime: '',
    caseCharges: '',
    versionStrategy: '',
    touchControl: '',
    openToConnect: '',
    wearDetection: '',
    driverType: '',
    windNoiseOptimized: '',
    audioCodec: '',
    lanyardHole: '',
    plugDiameter: '',
    lrMarkHeight: '',
    versionDifferences: '',
    remark: '',
  }
}

// 默认单项目完整状态（用于新建 + 持久化）
function getDefaultProjectState() {
  const materials = getInitialMaterials()
  const phases = PHASES
  const defaultColors = ['黑色', '白色', '蓝色', '绿色']
  const productColorsByPhase = { EV: [...defaultColors], DV1: [...defaultColors], DV2: [...defaultColors], PV: [...defaultColors] }
  const productDemands = {}
  PHASES.forEach((phase) => {
    productDemands[phase] = {}
    DEMAND_VERSION_KEYS.forEach((ver) => {
      productDemands[phase][ver] = {}
      defaultColors.forEach((c) => {
        const putIn = phase === 'DV1' ? (c === '黑色' || c === '白色' ? 200 : 100) : phase === 'DV2' ? 150 : 100
        const actual = phase === 'DV1' ? 120 : phase === 'DV2' ? 80 : 50
        productDemands[phase][ver][c] = { putInQty: putIn, structurePutInQty: 0, actualDemand: actual, customerSample: 0 }
      })
    })
  })
  return {
    projectName: '未命名项目',
    mdrNumber: '',
    projectProductImage: null,
    materials,
    productDemands,
    productColorsByPhase,
    filterVersion: '全部',
    filterPhase: 'DV1',
    phaseStartDates: { EV: '', DV1: '', DV2: '', PV: '' },
    phaseStartRanges: getDefaultPhaseStartRanges(),
    trialProductionTime: { EV: '', DV1: '', DV2: '', PV: '' },
    distributionRecords: [],
    projectPlanMilestones: DEFAULT_PLAN_MILESTONES.map((label, i) => ({ id: `pm_${i}`, label })),
    projectPlanColumns: DEFAULT_PLAN_COLUMNS.map((name, i) => ({ id: `pc_${i}`, name })),
    projectPlanCells: {},
    projectPlanComments: {},
    customerTeamMembers: [],
    internalMembers: [],
    workbookEntries: WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}),
    techReserve: getDefaultTechReserve(),
    productSpec: getDefaultProductSpec(),
    fileChecklist: DEFAULT_FILE_CHECKLIST.map(item => ({ ...item })),
  }
}

// 从 localStorage 读取项目列表
function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// 保存项目列表到 localStorage
function saveProjects(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error(e)
  }
}

// ---------- 工具函数 ----------
function getStatus(receivedQty, requiredQty) {
  if (requiredQty <= 0) return 'full'
  const rate = receivedQty / requiredQty
  if (rate >= 1) return 'full'
  if (rate > 0) return 'partial'
  return 'none'
}

function getRate(receivedQty, requiredQty) {
  if (requiredQty <= 0) return 100
  return Math.min(100, Math.round((receivedQty / requiredQty) * 100))
}

function isAtRisk(item) {
  const rate = getRate(item.receivedQty, item.requiredQty)
  if (rate === 0) return true
  const etaStr = String(item.eta || '').trim()
  if (!etaStr) return false
  const eta = new Date(etaStr)
  if (Number.isNaN(eta.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eta.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((eta - today) / 86400000)
  return daysLeft <= 3 && rate < 100
}

function parseYmdDate(s) {
  const str = String(s || '').trim()
  if (!str) return null
  const d = new Date(str)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

function formatYmd(d) {
  if (!d) return ''
  const dd = new Date(d)
  if (Number.isNaN(dd.getTime())) return ''
  return dd.toISOString().slice(0, 10)
}

function addDaysToYmd(ymd, days) {
  const d = parseYmdDate(ymd)
  if (!d) return ''
  const out = new Date(d.getTime() + days * 86400000)
  return formatYmd(out)
}

function diffDaysFromToday(ymd) {
  const d = parseYmdDate(ymd)
  if (!d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((d - today) / 86400000)
}

function formatDisplayDate(dateStr, format) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const d2 = String(d.getDate()).padStart(2, '0')
  switch (format) {
    case 'MM月DD日': return `${parseInt(m)}月${parseInt(d2)}日`
    case 'YYYY-MM-DD': return `${y}-${m}-${d2}`
    case 'YYYY/MM/DD': return `${y}/${m}/${d2}`
    case 'YYYY年MM月DD日': return `${y}年${m}月${d2}日`
    default: return `${y}-${m}-${d2}`
  }
}


const DEFAULT_FILE_CHECKLIST = [
  "Production process flow chart","Production line layout","PFMEA","CP","Jig/fixture list with release report","Equipment/test system list with release report","Production WI","Production line balance","Ramp up plan","Productivity plan","In line quality plan","Production process issue tracker","Detectability Assessment","Parts capacity (after all post processes) matches DA 模具产能（包括后处理的产能）","1st tooling released and MES aligned （CPK/FAI;Gap&step提供给客户放行模具，需收到客户放行的邮件）","Packing structure design released（找客户放行邮件或者签板）","Parts golden sample signed off (including color / PV packaging etc.) – Open/Done","Hardware release – Open/Done","Software release – Open/Done","Compliance test result pass","Part and Gates samples approved（签样情况）-中限， 相当于COLOR APPROVAL TRACKING STATUS","Tooling Status（实际与DA产能对比）","Tooling list","Gap & Step 30#","DA Files","LLT Material status（LLT List&LLT Tracking）","LLT BOM and authorization release – Open/Done & Document","ODM PO released for LLT parts and availability mapped – Open/Done & Document","Issue Tracker","MES file","CMF file","Compliance file","EES file","AES file","SRD file","UIS file","PRD file","PES file"
].map((name, i) => ({
  id: `fcl_${i + 1}`,
  checklist: name,
  person: '',
  dueDate: '',
  status: 'open',
  docPath: '',
  docFile: null,
  comment: ''
}))

const CHECKLIST_DEPT_HINTS = {
  'Production process flow chart': 'PE',
  'Production line layout': 'IE',
  'PFMEA': 'PE',
  'CP': 'IE',
  'Jig/fixture list with release report': 'IE',
  'Equipment/test system list with release report': 'TE',
  'Production WI': 'PE',
  'Production line balance': 'IE',
  'Ramp up plan': 'IE',
  'Productivity plan': 'IE',
  'In line quality plan': 'PE',
  'Production process issue tracker': 'PE',
  'Detectability Assessment': 'PE',
  'Parts capacity (after all post processes) matches DA 模具产能（包括后处理的产能）': '采购',
  '1st tooling released and MES aligned （CPK/FAI;Gap&step提供给客户放行模具，需收到客户放行的邮件）': 'ME',
  'Packing structure design released（找客户放行邮件或者签板）': 'Package',
  'Parts golden sample signed off (including color / PV packaging etc.) – Open/Done': 'ME',
  'Hardware release – Open/Done': 'EE',
  'Software release – Open/Done': 'SW',
  'Compliance test result pass': 'Compliance',
  'Part and Gates samples approved（签样情况）-中限， 相当于COLOR APPROVAL TRACKING STATUS': 'CMF',
  'Tooling Status（实际与DA产能对比）': 'PM',
  'Tooling list': 'ME',
  'Gap & Step 30#': 'DQE',
  'DA Files': '业务',
  'LLT Material status（LLT List&LLT Tracking）': '业务',
  'LLT BOM and authorization release – Open/Done & Document': '业务',
  'ODM PO released for LLT parts and availability mapped – Open/Done & Document': '业务',
  'Issue Tracker': 'PM',
  'MES file': 'ME',
  'CMF file': 'ME',
  'Compliance file': 'Compliance',
  'EES file': 'EE',
  'AES file': 'EE',
  'SRD file': 'SW',
  'UIS file': 'SW',
  'PRD file': 'PM',
  'PES file': 'Package'
}

function getDeptHint(checklistText) {
  const key = Object.keys(CHECKLIST_DEPT_HINTS).find(k => k === (checklistText || '').trim())
  return key ? CHECKLIST_DEPT_HINTS[key] : ''
}

// 简单富文本编辑器（支持加粗、列表、图片插入与粘贴图片）
function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    const el = editorRef.current
    if (!el) return
    onChange?.(el.innerHTML)
  }

  const handlePaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items
    if (!items) return
    const imageItems = Array.from(items).filter((it) => it.type && it.type.startsWith('image/'))
    if (imageItems.length === 0) return
    e.preventDefault()
    imageItems.forEach((it) => {
      const file = it.getAsFile()
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result
        if (!src) return
        document.execCommand('insertImage', false, src)
        handleInput()
      }
      reader.readAsDataURL(file)
    })
  }

  const exec = (cmd, arg) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    document.execCommand(cmd, false, arg)
    handleInput()
  }

  return (
    <div className="border border-slate-300 rounded-lg">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
        <span className="mr-1">格式</span>
        <button type="button" onClick={() => exec('bold')} className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-semibold">
          B
        </button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="px-1.5 py-0.5 rounded hover:bg-slate-200">
          • 列表
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('输入图片地址（URL）')
            if (url) exec('insertImage', url)
          }}
          className="px-1.5 py-0.5 rounded hover:bg-slate-200"
        >
          图片
        </button>
        <span className="ml-auto text-slate-400">可直接粘贴剪贴板图片</span>
      </div>
      <div
        ref={editorRef}
        className="min-h-[120px] max-h-[260px] overflow-y-auto px-3 py-2 text-xs text-slate-800 focus:outline-none prose prose-sm max-w-none"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  )
}

/** 根据当前日期与 ETA 的天数差返回关键物料行的背景样式：≤20 天蓝，<12 天黄，<7 天红 */
function getEtaRowBg(item) {
  const etaStr = String(item.eta || '').trim()
  if (!etaStr) return ''
  const eta = new Date(etaStr)
  if (Number.isNaN(eta.getTime())) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eta.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((eta - today) / 86400000)
  if (daysLeft < 7) return 'bg-red-100/80'
  if (daysLeft < 12) return 'bg-amber-100/80'
  if (daysLeft <= 20) return 'bg-blue-100/80'
  return ''
}

// ---------- 主应用 ----------
export default function App() {
  const [projects, setProjects] = useState(() => loadProjects())
  const [view, setView] = useState(() => (loadProjects().length === 0 ? 'editor' : 'list'))
  const [currentProjectId, setCurrentProjectId] = useState(null)

  // 当前编辑的项目状态（仅在 view === 'editor' 时使用）
  const [projectName, setProjectName] = useState('未命名项目')
  const [mdrNumber, setMdrNumber] = useState('')
  const [internalVersion, setInternalVersion] = useState('')
  const [projectProductImage, setProjectProductImage] = useState(null)
  const [materials, setMaterials] = useState(() => getInitialMaterials())
  const [productDemands, setProductDemands] = useState(() => getInitialProductDemands())
  const [productColorsByPhase, setProductColorsByPhase] = useState(() => ({
    EV: ['黑色', '白色', '蓝色', '绿色'],
    DV1: ['黑色', '白色', '蓝色', '绿色'],
    DV2: ['黑色', '白色', '蓝色', '绿色'],
    PV: ['黑色', '白色', '蓝色', '绿色'],
  }))
  const productDemandsRef = useRef(productDemands)
  const productColorsByPhaseRef = useRef(productColorsByPhase)
  useEffect(() => {
    productDemandsRef.current = productDemands
    productColorsByPhaseRef.current = productColorsByPhase
  }, [productDemands, productColorsByPhase])

  const [productTableRowOrder, setProductTableRowOrder] = useState(() => [...DEFAULT_TABLE_ROW_ORDER])
  const [productDemandPhase, setProductDemandPhase] = useState('DV1')
  const [demandEarphoneMode, setDemandEarphoneMode] = useState('可拆不可拆') // '可拆不可拆' | '通用'
  const [demandChargerMode, setDemandChargerMode] = useState('可拆不可拆')   // '可拆不可拆' | '通用'
  // 样机需求统计列显隐控制
  const ALL_DEMAND_COLUMNS = [
    { key: 'putInQty', label: '主板投产' },
    { key: 'fpcPutInQty', label: 'FPC&喇叭&电池' },
    { key: 'structurePutInQty', label: '结构备料' },
    { key: 'actualDemand', label: '实际需求' },
    { key: 'customerSample', label: '客户样机' },
    { key: 'yield', label: '良率' },
  ]
  const [earphoneColVis, setEarphoneColVis] = useState({ putInQty: true, fpcPutInQty: true, structurePutInQty: true, actualDemand: true, customerSample: true, yield: true })
  const [chargerColVis, setChargerColVis] = useState({ putInQty: true, structurePutInQty: true, actualDemand: true, yield: true })
  const [demandColDropdown, setDemandColDropdown] = useState(null) // null | '耳机' | '充电盒'
  const [editingColorPhase, setEditingColorPhase] = useState(null)
  const [editingColorKey, setEditingColorKey] = useState(null)
  const [editingColorValue, setEditingColorValue] = useState('')
  const [filterVersion, setFilterVersion] = useState('全部')
  const [filterPhase, setFilterPhase] = useState('DV1')
  const [phaseStartDates, setPhaseStartDates] = useState(() => ({ DV1: '', DV2: '', PV: '' }))
  const [phaseStartRanges, setPhaseStartRanges] = useState(() => getDefaultPhaseStartRanges())
  const [phaseStartRangesExpanded, setPhaseStartRangesExpanded] = useState(false)
  // preview states removed
  const [showDistributionList, setShowDistributionList] = useState(false)
  const [distributionRecords, setDistributionRecords] = useState(() => [])
  const [distributionStageFilter, setDistributionStageFilter] = useState('EV')
  const [distributionSaveHint, setDistributionSaveHint] = useState(false)
  const [showProjectPlan, setShowProjectPlan] = useState(false)
  const [showTechReserve, setShowTechReserve] = useState(false)
  const [projectPlanMilestones, setProjectPlanMilestones] = useState(() =>
    DEFAULT_PLAN_MILESTONES.map((label, i) => ({ id: `pm_${i}`, label }))
  )
  const [projectPlanColumns, setProjectPlanColumns] = useState(() =>
    DEFAULT_PLAN_COLUMNS.map((name, i) => ({ id: `pc_${i}`, name }))
  )
  const [projectPlanCells, setProjectPlanCells] = useState(() => ({}))
  // 试产时间从里程碑计划中自动读取（Actual plan 列）
  const trialProductionTime = useMemo(() => {
    const result = { EV: '', DV1: '', DV2: '', PV: '' }
    const phaseMap = { EV: 'EV build', DV1: 'DV1 build', DV2: 'DV2 build', PV: 'PV build' }
    for (const [phase, label] of Object.entries(phaseMap)) {
      const milestone = projectPlanMilestones.find(m => m.label === label)
      if (milestone) {
        result[phase] = projectPlanCells[`${milestone.id}_pc_1`] || projectPlanCells[`${milestone.id}_pc_0`] || ''
      }
    }
    return result
  }, [projectPlanMilestones, projectPlanCells])
  const [projectPlanComments, setProjectPlanComments] = useState(() => ({}))
  // 新增：项目计划页面和甘特图数据
  const [planPages, setPlanPages] = useState([{ id: 'milestone', name: '里程碑节点', type: 'milestone' }])
  const [ganttPlans, setGanttPlans] = useState({})
  const [projectPlanSaveHint, setProjectPlanSaveHint] = useState(false)
  const [planCommentModal, setPlanCommentModal] = useState(null)
  const [planCommentValue, setPlanCommentValue] = useState('')
  const [showProjectMembers, setShowProjectMembers] = useState(false)
  const [customerTeamMembers, setCustomerTeamMembers] = useState(() => [])
  const [internalMembers, setInternalMembers] = useState(() => [])
  const [projectMembersSaveHint, setProjectMembersSaveHint] = useState(false)
  const [showWorkbook, setShowWorkbook] = useState(false)
  const [workbookEntries, setWorkbookEntries] = useState(() =>
    WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {})
  )
  const [workbookSaveHint, setWorkbookSaveHint] = useState(false)
  const [techReserve, setTechReserve] = useState(() => getDefaultTechReserve())
  const [techReserveSaveHint, setTechReserveSaveHint] = useState(false)
  const [techActiveModule, setTechActiveModule] = useState(TECH_MODULES[0])
  const [techActiveId, setTechActiveId] = useState(null)
  const [techSearch, setTechSearch] = useState('')
  const [remarkModalMaterialId, setRemarkModalMaterialId] = useState(null)
  const [remarkModalKey, setRemarkModalKey] = useState(null)
  const [remarkModalPhase, setRemarkModalPhase] = useState(null)
  const [remarkModalValue, setRemarkModalValue] = useState('')
  const [workbookDetailModal, setWorkbookDetailModal] = useState(null)
  const [workbookDetailContent, setWorkbookDetailContent] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [showProductSpec, setShowProductSpec] = useState(false)
  const [productSpec, setProductSpec] = useState(() => getDefaultProductSpec())
  const [productSpecSaveHint, setProductSpecSaveHint] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    version: '通用',
    phase: 'DV1',
    supplier: '',
    unit: '套',
    riskLevel: '无',
    remark: '',
    arrivalTime: '',
    requiredQty: 0,
    leadTimeDays: 0,
    eta: new Date().toISOString().slice(0, 10),
    releaseDate: '',
    materialReadyTime: '',
  })

  // 试产问题点状态
  const [showTrialIssues, setShowTrialIssues] = useState(false)
  const [trialIssuesPhase, setTrialIssuesPhase] = useState('DV1')
  const [trialIssuesDeviceType, setTrialIssuesDeviceType] = useState('耳机')
  const [trialIssues, setTrialIssues] = useState(() => ({ EV: [], DV1: [], DV2: [], PV: [] }))
  const [trialIssuesSaveHint, setTrialIssuesSaveHint] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [newVersionInput, setNewVersionInput] = useState('')
  const [trialIssueModal, setTrialIssueModal] = useState(false)
  const [editingTrialIssue, setEditingTrialIssue] = useState(null)
  const [trialIssueVersions, setTrialIssueVersions] = useState(['V1.0'])
  const [selectedTrialVersion, setSelectedTrialVersion] = useState('')
  // 试产问题点分类选项（按顺序）
  const TRIAL_ISSUE_CATEGORIES = ['生产', '电子', '工程', '声学', '软件', '结构', '作业管控', '其他']
  
  // 文件资料类型选项（按顺序）

  const [trialIssueForm, setTrialIssueForm] = useState({
    removable: '可拆',
    category: '生产',
    phenomenon: '',
    cause: '',
    solution: '',
    owner: '',
    priority: '中',
    closeTime: '',
    status: '待处理'
  })

  // 文件资料（Checklist表格）状态
  const [showFileLibrary, setShowFileLibrary] = useState(false)
  const [fileChecklist, setFileChecklist] = useState(() => DEFAULT_FILE_CHECKLIST.map(item => ({ ...item })))
  const [fileLibrarySaveHint, setFileLibrarySaveHint] = useState(false)
  const [showInternalVersionModal, setShowInternalVersionModal] = useState(false)
  const [internalVersionValue, setInternalVersionValue] = useState('')

  // 文件资料负责人自动匹配内部成员：dept hint → internalMembers role
  useEffect(() => {
    if (!fileChecklist || !internalMembers) return
    let changed = false
    const updated = fileChecklist.map(item => {
      if (item.person && item.person.trim() !== '') return item
      const dept = getDeptHint(item.checklist)
      if (!dept) return item
      const depts = dept.split('/').map(d => d.trim())
      for (const d of depts) {
        const member = internalMembers.find(m => m.role?.trim() === d)
        if (member?.name?.trim()) {
          changed = true
          return { ...item, person: member.name.trim() }
        }
      }
      return item
    })
    if (changed) setFileChecklist(updated)
  }, [internalMembers])

  // 产前准备状态
  const PRE_PRODUCTION_ITEMS = [
    { id: 'pp_1', name: '组装治具' },
    { id: 'pp_2', name: '辅料清单、Flow Chart/WI/QCP' },
    { id: 'pp_3', name: 'ATE 测试系统调试' },
    { id: 'pp_4', name: '产测设备/产测设备软件/测试治具搭建' },
    { id: 'pp_5', name: '包装产测系统调试' }
  ]
  const [preProductionData, setPreProductionData] = useState(() => ({
    EV: {},
    DV1: {},
    DV2: {},
    PV: {}
  }))
  const [preProductionPhase, setPreProductionPhase] = useState('DV1')

  const loadProjectIntoEditor = (project) => {
    if (!project) {
      const def = getDefaultProjectState()
      setProjectName(def.projectName)
      setMaterials(def.materials)
    setProductDemands(def.productDemands)
    setProductColorsByPhase(def.productColorsByPhase)
    productDemandsRef.current = def.productDemands
    productColorsByPhaseRef.current = def.productColorsByPhase
    setProductTableRowOrder(def.productTableRowOrder || [...DEFAULT_TABLE_ROW_ORDER])
    setProductDemandPhase('DV1')
      setFilterVersion(def.filterVersion)
    setFilterPhase(def.filterPhase || 'DV1')
    setPhaseStartDates(def.phaseStartDates || { EV: '', DV1: '', DV2: '', PV: '' })
    setPhaseStartRanges(def.phaseStartRanges || getDefaultPhaseStartRanges())
    setDistributionRecords(def.distributionRecords || [])
    setDistributionStageFilter('EV')
    setCurrentProjectId(null)
    setProjectPlanMilestones(def.projectPlanMilestones || DEFAULT_PLAN_MILESTONES.map((l, i) => ({ id: `pm_${i}`, label: l })))
    setProjectPlanColumns(def.projectPlanColumns || DEFAULT_PLAN_COLUMNS.map((n, i) => ({ id: `pc_${i}`, name: n })))
    setProjectPlanCells(def.projectPlanCells || {})
    setProjectPlanComments(def.projectPlanComments || {})
    setPlanPages(def.planPages || [{ id: 'milestone', name: '里程碑节点', type: 'milestone' }])
    setGanttPlans(def.ganttPlans || {})
    setCustomerTeamMembers(def.customerTeamMembers || [])
    setInternalMembers(def.internalMembers || [])
    setWorkbookEntries(def.workbookEntries || WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}))
    setMdrNumber(def.mdrNumber || '')
    setProjectProductImage(def.projectProductImage ?? null)
    setProductSpec(def.productSpec || getDefaultProductSpec())
    // 重置试产问题点
    setTrialIssues({ EV: [], DV1: [], DV2: [], PV: [] })
    setTrialIssuesPhase('DV1')
    setTrialIssuesDeviceType('耳机')
    // 重置文件资料库
    setFileChecklist(DEFAULT_FILE_CHECKLIST.map(item => ({ ...item })))
    // 重置产前准备
    setPreProductionData({ EV: {}, DV1: {}, DV2: {}, PV: {} })
      return
    }
    setProjectName(project.projectName || project.name || '未命名项目')
    setMaterials(project.materials || getInitialMaterials())
    const migrateKey = (k) => (k === '可拆' ? 'Replaceable' : k === '不可拆' ? 'Non-replaceable' : k === '客户实际需求-可拆' ? '客户实际需求-Replaceable' : k === '客户实际需求-不可拆' ? '客户实际需求-Non-replaceable' : k)
    const rawDemands = project.productDemands || getInitialProductDemands()
    const isNewDemandFormat = (d) => {
      if (!d || typeof d !== 'object') return false
      const firstPhase = Object.keys(d)[0]
      if (!firstPhase || !d[firstPhase]) return true
      const firstVer = Object.keys(d[firstPhase])[0]
      if (!firstVer) return true
      const colorMap = d[firstPhase][firstVer]
      if (!colorMap || typeof colorMap !== 'object') return false
      const firstColor = Object.keys(colorMap)[0]
      const cell = firstColor ? colorMap[firstColor] : null
      return cell != null && typeof cell === 'object' && ('putInQty' in cell || 'actualDemand' in cell)
    }
    const migratedDemands = isNewDemandFormat(rawDemands)
      ? rawDemands
      : (() => {
          const out = {}
          PHASES.forEach((phase) => {
            out[phase] = { '耳机可拆': {}, '耳机不可拆': {}, '充电盒可拆': {}, '充电盒不可拆': {} }
            const phaseData = rawDemands[phase] || {}
            const colors = project.productColorsByPhase?.[phase] || ['黑色', '白色', '蓝色', '绿色']
            const getVal = (rowKey, c) => Number(phaseData[rowKey]?.[c]) || 0
            colors.forEach((c) => {
              const putInR = getVal('Replaceable', c)
              const actualR = getVal('客户实际需求-Replaceable', c)
              const putInN = getVal('Non-replaceable', c)
              const actualN = getVal('客户实际需求-Non-replaceable', c)
              out[phase]['耳机可拆'][c] = { putInQty: putInR, structurePutInQty: 0, actualDemand: actualR, customerSample: 0 }
              out[phase]['耳机不可拆'][c] = { putInQty: putInN, structurePutInQty: 0, actualDemand: actualN, customerSample: 0 }
              out[phase]['充电盒可拆'][c] = { putInQty: putInR, structurePutInQty: 0, actualDemand: actualR, customerSample: 0 }
              out[phase]['充电盒不可拆'][c] = { putInQty: putInN, structurePutInQty: 0, actualDemand: actualN, customerSample: 0 }
            })
          })
          return out
        })()
    // 确保含 EV 阶段及每 cell 含 structurePutInQty
    PHASES.forEach((p) => {
      if (!migratedDemands[p]) {
        migratedDemands[p] = { '耳机可拆': {}, '耳机不可拆': {}, '充电盒可拆': {}, '充电盒不可拆': {} }
        const colors = project.productColorsByPhase?.[p] || ['黑色', '白色', '蓝色', '绿色']
        colors.forEach((c) => {
          DEMAND_VERSION_KEYS.forEach((ver) => {
            migratedDemands[p][ver][c] = { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
          })
        })
      }
      DEMAND_VERSION_KEYS.forEach((ver) => {
        Object.keys(migratedDemands[p][ver] || {}).forEach((c) => {
          const cell = migratedDemands[p][ver][c]
          if (cell && !('structurePutInQty' in cell)) cell.structurePutInQty = 0
        })
      })
    })
    setProductDemands(migratedDemands)
    setProductColorsByPhase({ EV: ['黑色','白色','蓝色','绿色'], DV1: ['黑色','白色','蓝色','绿色'], DV2: ['黑色','白色','蓝色','绿色'], PV: ['黑色','白色','蓝色','绿色'], ...(project.productColorsByPhase || {}) })
    productDemandsRef.current = migratedDemands
    productColorsByPhaseRef.current = { EV: ['黑色','白色','蓝色','绿色'], DV1: ['黑色','白色','蓝色','绿色'], DV2: ['黑色','白色','蓝色','绿色'], PV: ['黑色','白色','蓝色','绿色'], ...(project.productColorsByPhase || {}) }
    const rawOrder = project.productTableRowOrder || [...DEFAULT_TABLE_ROW_ORDER]
    setProductTableRowOrder(rawOrder.map(migrateKey))
    setProductDemandPhase('DV1')
    setFilterVersion(project.filterVersion || '全部')
    setFilterPhase(project.filterPhase || 'DV1')
    setPhaseStartDates({ EV: '', DV1: '', DV2: '', PV: '', ...(project.phaseStartDates || {}) })
    setPhaseStartRanges(project.phaseStartRanges ? (() => {
      const def = getDefaultPhaseStartRanges()
      const norm = (arr) => (arr || []).slice(0, 4).map((r, i) => ({ start: r?.start ?? '', end: r?.end ?? '' }))
      const 可拆 = norm(project.phaseStartRanges.可拆)
      const 不可拆 = norm(project.phaseStartRanges.不可拆)
      while (可拆.length < 4) 可拆.push({ start: '', end: '' })
      while (不可拆.length < 4) 不可拆.push({ start: '', end: '' })
      return { 可拆, 不可拆 }
    })() : getDefaultPhaseStartRanges())
    setTechReserve(project.techReserve || getDefaultTechReserve())
    setDistributionRecords(project.distributionRecords || [])
    setDistributionStageFilter('EV')
    setProjectPlanMilestones(project.projectPlanMilestones || DEFAULT_PLAN_MILESTONES.map((l, i) => ({ id: `pm_${i}`, label: l })))
    setProjectPlanColumns(project.projectPlanColumns || DEFAULT_PLAN_COLUMNS.map((n, i) => ({ id: `pc_${i}`, name: n })))
    setProjectPlanCells(project.projectPlanCells || {})
    setProjectPlanComments(project.projectPlanComments || {})
    setPlanPages(project.planPages || [{ id: 'milestone', name: '里程碑节点', type: 'milestone' }])
    setGanttPlans(project.ganttPlans || {})
    setCustomerTeamMembers(project.customerTeamMembers || [])
    setInternalMembers(project.internalMembers || [])
    setWorkbookEntries(project.workbookEntries || WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}))
    setMdrNumber(project.mdrNumber || '')
    setInternalVersion(project.internalVersion || '')
    setProjectProductImage(project.projectProductImage ?? null)
    setProductSpec(project.productSpec ? { ...getDefaultProductSpec(), ...project.productSpec } : getDefaultProductSpec())
    // 加载试产问题点数据
    setTrialIssues(project.trialIssues || { EV: [], DV1: [], DV2: [], PV: [] })
    setTrialIssuesPhase(project.trialIssuesPhase || 'DV1')
    setTrialIssuesDeviceType(project.trialIssuesDeviceType || '耳机')
    // 加载文件资料库数据
    setFileChecklist(project.fileChecklist || DEFAULT_FILE_CHECKLIST.map(item => ({ ...item })))
    // 加载产前准备数据
    setPreProductionData(project.preProductionData || { EV: {}, DV1: {}, DV2: {}, PV: {} })
    // 加载内部版本号
    setInternalVersion(project.internalVersion || '')
    setCurrentProjectId(project.id)
  }

  const handleNewProject = () => {
    loadProjectIntoEditor(null)
    setView('editor')
  }

  const handleOpenProject = (project) => {
    loadProjectIntoEditor(project)
    setView('editor')
  }

  const handleSave = (options) => {
    const silent = options && options.silent === true
    const capture = {
      projectName,
      mdrNumber,
      projectProductImage,
      materials,
      productDemands,
      productColorsByPhase,
      productTableRowOrder,
      filterVersion,
      filterPhase,
      phaseStartDates,
      phaseStartRanges,
      distributionRecords,
      projectPlanMilestones,
      projectPlanColumns,
      projectPlanCells,
      projectPlanComments,
      planPages,
      ganttPlans,
      customerTeamMembers,
      internalMembers,
      workbookEntries,
      techReserve,
      productSpec,
      trialIssues,
      trialIssuesPhase,
      trialIssuesDeviceType,
      fileChecklist,
      preProductionData,
      internalVersion,
      currentProjectId,
      projects,
    }
    const doSave = () => {
      const latestDemands = productDemandsRef.current ?? capture.productDemands
      const latestColorsByPhase = productColorsByPhaseRef.current ?? capture.productColorsByPhase
      const state = {
        projectName: capture.projectName,
        mdrNumber: capture.mdrNumber,
        internalVersion: capture.internalVersion,
        projectProductImage: capture.projectProductImage,
        materials: capture.materials,
        productDemands: latestDemands,
        productColorsByPhase: latestColorsByPhase,
        productTableRowOrder: capture.productTableRowOrder,
        filterVersion: capture.filterVersion,
        filterPhase: capture.filterPhase,
        phaseStartDates: capture.phaseStartDates,
        phaseStartRanges: capture.phaseStartRanges,
        distributionRecords: capture.distributionRecords,
        projectPlanMilestones: capture.projectPlanMilestones,
        projectPlanColumns: capture.projectPlanColumns,
        projectPlanCells: capture.projectPlanCells,
        projectPlanComments: capture.projectPlanComments,
        planPages: capture.planPages,
        ganttPlans: capture.ganttPlans,
        customerTeamMembers: capture.customerTeamMembers,
        internalMembers: capture.internalMembers,
        workbookEntries: capture.workbookEntries,
        techReserve: capture.techReserve,
        productSpec: capture.productSpec,
        trialIssues: capture.trialIssues,
        trialIssuesPhase: capture.trialIssuesPhase,
        trialIssuesDeviceType: capture.trialIssuesDeviceType,
        fileChecklist: capture.fileChecklist,
        preProductionData: capture.preProductionData,
      }
      const id = capture.currentProjectId || `p_${Date.now()}`
      const name = (capture.projectName || '').trim() || '未命名项目'
      const savedAt = Date.now()
      const list = (capture.projects || []).filter((p) => p.id !== id)
      list.unshift({ id, name, savedAt, ...state })
      setProjects(list)
      saveProjects(list)
      setCurrentProjectId(id)
      setProjectName(name)
      if (!silent) window.alert('已保存')
    }
    doSave()
  }

  const handleExportBackup = () => {
    const data = {
      backupAt: new Date().toISOString(),
      app: 'TWS 试产长周期物料追踪面板',
      projectCount: projects.length,
      projects,
    }
    const json = JSON.stringify(data, null, 2)
    // 备份：写入本地备份键，便于后续从备份恢复
    try {
      localStorage.setItem(STORAGE_KEY_BACKUP, json)
    } catch (e) {
      console.error('备份写入失败', e)
    }
    // 导出：下载 JSON 文件
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TWS物料追踪_全部项目_备份_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    window.alert('已导出文件并已备份到本地。')
  }

  const handleRestoreFromBackup = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = (e) => {
      const file = e.target?.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const raw = reader.result
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw
          const list = data.projects && Array.isArray(data.projects) ? data.projects : []
          if (list.length === 0) {
            window.alert('所选文件中没有项目数据或格式不正确。')
            return
          }
          if (!window.confirm(`确定从所选文件恢复？将用文件中的 ${list.length} 个项目覆盖当前项目列表。`)) return
          setProjects(list)
          saveProjects(list)
          window.alert('已从所选文件恢复。')
        } catch (err) {
          console.error(err)
          window.alert('恢复失败：请选择本应用导出的 JSON 备份文件。')
        }
      }
      reader.readAsText(file, 'UTF-8')
    }
    input.click()
  }

  const handleBackToList = () => {
    handleSave({ silent: true })
    setView('list')
  }

  const handleDeleteProject = (id) => {
    if (!window.confirm('确定删除该项目？')) return
    const list = projects.filter((p) => p.id !== id)
    setProjects(list)
    saveProjects(list)
  }

  const handleCopyProject = (project) => {
    const copy = { ...project, id: `p_${Date.now()}`, name: `${project.name || project.projectName || '未命名项目'} - 副本`, savedAt: Date.now() }
    const list = [copy, ...projects]
    setProjects(list)
    saveProjects(list)
    loadProjectIntoEditor(copy)
    setView('editor')
  }

  const addDistributionRow = () => {
    setDistributionRecords((prev) => [
      ...prev,
      {
        id: `dr_${Date.now()}`,
        stage: distributionStageFilter,
        earphoneSet: '',
        charging: '',
        pcba: '',
        structureHand: '',
        color: '',
        company: '',
        recipient: '',
        personInCharge: '',
        receiptTime: '',
        remark: '',
      },
    ])
  }

  const updateDistributionRecord = (id, field, value) => {
    setDistributionRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const deleteDistributionRow = (id) => {
    setDistributionRecords((prev) => prev.filter((r) => r.id !== id))
  }

  const filteredDistributionRecords = useMemo(() => {
    return distributionRecords.filter((r) => r.stage === distributionStageFilter)
  }, [distributionRecords, distributionStageFilter])

  const addProjectPlanColumn = () => {
    setProjectPlanColumns((prev) => [...prev, { id: `pc_${Date.now()}`, name: '新列' }])
  }
  const deleteProjectPlanColumn = (colId) => {
    if (projectPlanColumns.length <= 1) { window.alert('至少保留一列'); return }
    if (!window.confirm('确定删除该列？该列下所有日期数据将一并清除。')) return
    setProjectPlanColumns((prev) => prev.filter((c) => c.id !== colId))
    setProjectPlanCells((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => { if (key.endsWith(`_${colId}`)) delete next[key] })
      return next
    })
  }
  const updateProjectPlanColumnName = (colId, name) => {
    setProjectPlanColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, name } : c)))
  }
  const getPlanCellKey = (milestoneId, colId) => `${milestoneId}_${colId}`
  const updateProjectPlanCell = (milestoneId, colId, value) => {
    setProjectPlanCells((prev) => ({ ...prev, [getPlanCellKey(milestoneId, colId)]: value }))
  }
  const updateProjectPlanComment = (milestoneId, value) => {
    setProjectPlanComments((prev) => ({ ...prev, [milestoneId]: value }))
  }
  const addProjectPlanMilestone = () => {
    setProjectPlanMilestones((prev) => [...prev, { id: `pm_${Date.now()}`, label: '新节点' }])
  }
  const deleteProjectPlanMilestone = (milestoneId) => {
    if (projectPlanMilestones.length <= 1) { window.alert('至少保留一行'); return }
    if (!window.confirm('确定删除该行？该节点及备注将一并清除。')) return
    setProjectPlanMilestones((prev) => prev.filter((m) => m.id !== milestoneId))
    setProjectPlanComments((prev) => {
      const next = { ...prev }
      delete next[milestoneId]
      return next
    })
    setProjectPlanCells((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => { if (key.startsWith(`${milestoneId}_`)) delete next[key] })
      return next
    })
  }
  const updateProjectPlanMilestoneLabel = (milestoneId, label) => {
    setProjectPlanMilestones((prev) => prev.map((m) => (m.id === milestoneId ? { ...m, label } : m)))
  }

  const createEmptyMember = () => ({ id: `mem_${Date.now()}`, role: '', name: '', email: '', phone: '', remark: '' })
  const addCustomerMember = () => setCustomerTeamMembers((prev) => [...prev, createEmptyMember()])
  const addInternalMember = () => setInternalMembers((prev) => [...prev, createEmptyMember()])
  const updateCustomerMember = (id, field, value) => {
    setCustomerTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }
  const updateInternalMember = (id, field, value) => {
    setInternalMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }
  const deleteCustomerMember = (id) => setCustomerTeamMembers((prev) => prev.filter((m) => m.id !== id))
  const deleteInternalMember = (id) => setInternalMembers((prev) => prev.filter((m) => m.id !== id))
  
  // 移动客户成员顺序
  const moveCustomerMemberUp = (id) => {
    setCustomerTeamMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]
      return next
    })
  }
  const moveCustomerMemberDown = (id) => {
    setCustomerTeamMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }
  
  // 移动内部成员顺序
  const moveInternalMemberUp = (id) => {
    setInternalMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]
      return next
    })
  }
  const moveInternalMemberDown = (id) => {
    setInternalMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  const addWorkbookEntry = (category) => {
    setWorkbookEntries((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: `wb_${Date.now()}`, content: '', responsiblePerson: '', raisedTime: '', riskLevel: '无' }],
    }))
  }
  const updateWorkbookEntry = (category, id, field, value) => {
    setWorkbookEntries((prev) => ({
      ...prev,
      [category]: (prev[category] || []).map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }))
  }
  const deleteWorkbookEntry = (category, id) => {
    setWorkbookEntries((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((e) => e.id !== id),
    }))
  }

  // 技术储备：增删改
  const addTechEntry = (module) => {
    const id = `tech_${Date.now()}`
    const entry = {
      id,
      module,
      term: '',
      summary: '',
      details: '',
      notes: '',
      tags: '',
      phaseScope: '',
      owner: '',
      updatedAt: Date.now(),
    }
    setTechReserve((prev) => ({
      ...prev,
      [module]: [entry, ...(prev[module] || [])],
    }))
    setTechActiveModule(module)
    setTechActiveId(id)
  }

  const updateTechEntry = (module, id, field, value) => {
    setTechReserve((prev) => ({
      ...prev,
      [module]: (prev[module] || []).map((e) =>
        e.id === id ? { ...e, [field]: value, updatedAt: Date.now() } : e
      ),
    }))
  }

  const deleteTechEntry = (module, id) => {
    if (!window.confirm('确定删除该条技术储备？')) return
    setTechReserve((prev) => ({
      ...prev,
      [module]: (prev[module] || []).filter((e) => e.id !== id),
    }))
    setTechActiveId(null)
  }
  const exportWorkbookToExcel = () => {
    const wb = XLSX.utils.book_new()
    const rows = [['Category', 'Actions or Details', '责任人', '问题提出时间', '风险程度']]
    WORKBOOK_CATEGORIES.forEach((cat) => {
      (workbookEntries[cat] || []).forEach((e) => {
        rows.push([cat, e.content || '', e.responsiblePerson || '', e.raisedTime || '', e.riskLevel || ''])
      })
    })
    if (rows.length === 1) rows.push(['', '', '', '', ''])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const name = `${(projectName || '项目问题点').replace(/[/\\?*\[\]:]/g, '_')}_项目问题点_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.utils.book_append_sheet(wb, ws, 'Issues')
    XLSX.writeFile(wb, name)
  }

  // 试产问题点：增删改
  const addTrialIssue = () => {
    const newIssue = {
      id: `ti_${Date.now()}`,
      ...trialIssueForm,
      createdAt: new Date().toISOString()
    }
    setTrialIssues((prev) => ({
      ...prev,
      [trialIssuesPhase]: [...(prev[trialIssuesPhase] || []), newIssue]
    }))
    setTrialIssueModal(false)
    setTrialIssueForm({
      removable: '可拆',
      category: '生产',
      phenomenon: '',
      cause: '',
      solution: '',
      owner: '',
      priority: '中',
      closeTime: '',
      status: '待处理'
    })
  }

  const updateTrialIssue = (id, field, value) => {
    setTrialIssues((prev) => ({
      ...prev,
      [trialIssuesPhase]: (prev[trialIssuesPhase] || []).map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      )
    }))
  }

  const deleteTrialIssue = (id) => {
    if (!window.confirm('确定删除该问题点？')) return
    setTrialIssues((prev) => ({
      ...prev,
      [trialIssuesPhase]: (prev[trialIssuesPhase] || []).filter((e) => e.id !== id)
    }))
  }

  // 添加新版本
  const addTrialIssueVersion = () => {
    if (!newVersionInput.trim()) return
    if (trialIssueVersions.includes(newVersionInput.trim())) {
      alert('该版本已存在')
      return
    }
    setTrialIssueVersions((prev) => [...prev, newVersionInput.trim()])
    setNewVersionInput('')
    setShowVersionModal(false)
  }

  // 文件库（Checklist）Doc link 处理：浏览选择文件
  const handleDocLinkSelect = (itemId) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFileChecklist((prev) => prev.map((item) =>
          item.id === itemId ? {
            ...item,
            docFile: { name: file.name, data: ev.target.result }
          } : item
        ))
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const removeDocLink = (itemId) => {
    setFileChecklist((prev) => prev.map((item) =>
      item.id === itemId ? { ...item, docPath: '', docFile: null } : item
    ))
  }

  // 下载上传的文件
  const downloadDocFile = (item) => {
    if (!item.docFile?.data) return
    const a = document.createElement('a')
    a.href = item.docFile.data
    a.download = item.docFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const updateDocPath = (itemId, value) => {
    setFileChecklist((prev) => prev.map((item) =>
      item.id === itemId ? { ...item, docPath: value } : item
    ))
  }

  const exportFileChecklistExcel = () => {
    const headers = ['No.', 'Checklist', '负责人', '要求完成时间', 'Status', 'Doc. link', 'Comment']
    const rows = [headers]
    let openCount = 0, closeCount = 0
    fileChecklist.forEach((item, index) => {
      if (item.status === 'open') openCount++
      else if (item.status === 'close') closeCount++
      rows.push([
        String(index + 1),
        item.checklist || '',
        item.person || '',
        item.dueDate || '',
        item.status || 'open',
        item.docPath || item.docFile?.name || '',
        item.comment || ''
      ])
    })
    // 添加统计行
    rows.push([])
    rows.push([`共 ${fileChecklist.length} 项`, `open: ${openCount}`, `close: ${closeCount}`])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    // 设置列宽
    ws['!cols'] = [
      { wch: 5 },   // No.
      { wch: 50 },  // Checklist
      { wch: 15 },  // 负责人
      { wch: 15 },  // 要求完成时间
      { wch: 10 },  // Status
      { wch: 30 },  // Doc. link
      { wch: 30 },  // Comment
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Checklist')
    XLSX.writeFile(wb, `${(projectName || '项目').replace(/[/\\?*\[\]:]/g, '_')}_文件资料_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const exportDistributionExcel = () => {
    const headers = ['样品阶段', '耳机(套)', '充电盒', 'PCBA', '耳机结构手板', '颜色', '公司', '领用人', '负责人', '领用时间', '备注']
    const rows = [headers]
    distributionRecords.forEach((r) => {
      rows.push([r.stage || '', r.earphoneSet || '', r.charging || '', r.pcba || '', r.structureHand || '', r.color || '', r.company || '', r.recipient || '', r.personInCharge || '', r.receiptTime || '', r.remark || ''])
    })
    if (rows.length === 1) rows.push(headers.map(() => ''))
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '样机分发')
    XLSX.writeFile(wb, `${(projectName || '项目').replace(/[/\\?*\[\]:]/g, '_')}_样机分发_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
  const importDistributionExcel = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      try {
        const wb = XLSX.read(r.result, { type: 'binary' })
        const sh = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sh, { header: 1 })
        if (!Array.isArray(data) || data.length < 2) return
        const [, ...rows] = data
        const next = rows.map((row, i) => ({
          id: `dr_${Date.now()}_${i}`,
          stage: String(row[0] ?? distributionStageFilter).trim() || distributionStageFilter,
          earphoneSet: String(row[1] ?? '').trim(),
          charging: String(row[2] ?? '').trim(),
          pcba: String(row[3] ?? '').trim(),
          structureHand: String(row[4] ?? '').trim(),
          color: String(row[5] ?? '').trim(),
          company: String(row[6] ?? '').trim(),
          recipient: String(row[7] ?? '').trim(),
          personInCharge: String(row[8] ?? '').trim(),
          receiptTime: row[9] != null ? String(row[9]) : '',
          remark: String(row[10] ?? '').trim(),
        }))
        setDistributionRecords((prev) => [...prev, ...next])
      } catch (err) { console.error(err); window.alert('导入失败，请检查文件格式') }
    }
    r.readAsBinaryString(file)
    e.target.value = ''
  }

  const exportPlanExcel = () => {
    const wsData = [['Key Milestones', ...projectPlanColumns.map((c) => c.name), 'Comments']]
    projectPlanMilestones.forEach((m) => {
      const row = [m.label]
      projectPlanColumns.forEach((col) => { row.push(projectPlanCells[`${m.id}_${col.id}`] ?? '') })
      row.push(projectPlanComments[m.id] ?? '')
      wsData.push(row)
    })
    if (wsData.length === 1) wsData.push(wsData[0].map(() => ''))
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目计划')
    XLSX.writeFile(wb, `${(projectName || '项目').replace(/[/\\?*\[\]:]/g, '_')}_项目计划_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
  const importPlanExcel = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: 'binary' })
        const sh = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sh, { header: 1 })
        if (!Array.isArray(data) || data.length < 2) return
        const header = data[0]
        const colNames = header.slice(1, -1)
        const newCols = colNames.map((name, i) => ({ id: `pc_${Date.now()}_${i}`, name: String(name || '').trim() || `列${i + 1}` }))
        setProjectPlanColumns(newCols)
        const newMilestones = []
        const newCells = {}
        const newComments = {}
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          const label = String(row[0] ?? '').trim()
          if (!label) continue
          const mid = `pm_${Date.now()}_${i}`
          newMilestones.push({ id: mid, label })
          newCols.forEach((col, j) => { newCells[`${mid}_${col.id}`] = row[j + 1] != null ? String(row[j + 1]) : '' })
          newComments[mid] = row[row.length - 1] != null ? String(row[row.length - 1]) : ''
        }
        setProjectPlanMilestones(newMilestones)
        setProjectPlanCells(newCells)
        setProjectPlanComments(newComments)
      } catch (err) { console.error(err); window.alert('导入失败，请检查文件格式') }
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  const exportMembersExcel = () => {
    const wb = XLSX.utils.book_new()
    const customerRows = [['类型', '职位', '名称', '邮件', '电话', '备注']]
    customerTeamMembers.forEach((m) => customerRows.push(['客户', m.role || '', m.name || '', m.email || '', m.phone || '', m.remark || '']))
    internalMembers.forEach((m) => customerRows.push(['内部', m.role || '', m.name || '', m.email || '', m.phone || '', m.remark || '']))
    if (customerRows.length === 1) customerRows.push(customerRows[0].map(() => ''))
    const ws = XLSX.utils.aoa_to_sheet(customerRows)
    XLSX.utils.book_append_sheet(wb, ws, '项目成员')
    XLSX.writeFile(wb, `${(projectName || '项目').replace(/[/\\?*\[\]:]/g, '_')}_项目成员_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
  const importMembersExcel = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: 'binary' })
        const sh = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sh, { header: 1 })
        if (!Array.isArray(data) || data.length < 2) return
        const customer = []
        const internal = []
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          const type = String(row[0] ?? '').trim()
          const rec = { id: `mem_${Date.now()}_${i}`, role: String(row[1] ?? '').trim(), name: String(row[2] ?? '').trim(), email: String(row[3] ?? '').trim(), phone: String(row[4] ?? '').trim(), remark: String(row[5] ?? '').trim() }
          if (type === '内部') internal.push(rec)
          else customer.push(rec)
        }
        if (customer.length) setCustomerTeamMembers((prev) => [...prev, ...customer])
        if (internal.length) setInternalMembers((prev) => [...prev, ...internal])
      } catch (err) { console.error(err); window.alert('导入失败，请检查文件格式') }
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  const exportDemandExcel = () => {
    const phase = productDemandPhase
    const colors = productColorsByPhase[phase] || []
    const earphoneVersions = demandEarphoneMode === '通用' ? ['耳机可拆'] : ['耳机可拆', '耳机不可拆']
    const chargerVersions = demandChargerMode === '通用' ? ['充电盒可拆'] : ['充电盒可拆', '充电盒不可拆']
    const earphoneLabels = demandEarphoneMode === '通用' ? { '耳机可拆': '通用' } : { '耳机可拆': '耳机-可拆', '耳机不可拆': '耳机-不可拆' }
    const chargerLabels = demandChargerMode === '通用' ? { '充电盒可拆': '通用' } : { '充电盒可拆': '充电盒-可拆', '充电盒不可拆': '充电盒-不可拆' }
    const buildSection = (versionKeys, versionLabels, visibleColumns) => {
      const colDefs = ALL_DEMAND_COLUMNS.filter(c => visibleColumns[c.key])
      const headerRow = ['颜色']
      versionKeys.forEach((ver) => {
        const label = versionLabels[ver]
        colDefs.forEach((col) => {
          headerRow.push(`${label}-${col.label}`)
        })
      })
      const rows = [headerRow]
      colors.forEach((color) => {
        const row = [color]
        versionKeys.forEach((ver) => {
          const cell = (productDemands[phase]?.[ver]?.[color]) || { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
          const putIn = Number(cell.putInQty) || 0
          const actual = Number(cell.actualDemand) || 0
          const yieldPct = putIn > 0 && actual > 0 ? Math.min(100, Math.round((actual / putIn) * 100)) : ''
          colDefs.forEach((col) => {
            if (col.key === 'putInQty') row.push(cell.putInQty ?? '')
            else if (col.key === 'fpcPutInQty') row.push(cell.fpcPutInQty ?? '')
            else if (col.key === 'structurePutInQty') row.push(cell.structurePutInQty ?? '')
            else if (col.key === 'actualDemand') row.push(cell.actualDemand ?? '')
            else if (col.key === 'customerSample') row.push(cell.customerSample ?? '')
            else if (col.key === 'yield') row.push(yieldPct !== '' ? `${yieldPct}%` : '')
          })
        })
        rows.push(row)
      })
      const sumRow = ['合计']
      versionKeys.forEach((ver) => {
        colDefs.forEach((col) => {
          if (col.key === 'yield') { sumRow.push('—'); return }
          const sum = colors.reduce((s, c) => s + (Number((productDemands[phase]?.[ver]?.[c])?.[col.key]) || 0), 0)
          sumRow.push(sum || 0)
        })
      })
      rows.push(sumRow)
      return rows
    }
    const rows = [
      [`样机需求统计 - 阶段 ${phase}`, ''],
      [],
      ['耳机'],
      ...buildSection(earphoneVersions, earphoneLabels, earphoneColVis),
      [],
      ['充电盒'],
      ...buildSection(chargerVersions, chargerLabels, chargerColVis),
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '样机需求统计')
    XLSX.writeFile(wb, `${(projectName || '项目').replace(/[/\\?*\[\]:]/g, '_')}_样机需求统计_${phase}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // 以 DV1 为基准的关键物料键（名称+顺序一致）；增删以 DV1 为准，四阶段同步；数量/时间等各阶段可单独编辑
  const getMaterialRow = (name, version, phase) =>
    materials.find((m) => m.name === name && (m.version || '通用') === version && (m.phase || 'DV1') === phase)

  const keyMaterialKeys = useMemo(() => {
    const dv1Rows = materials.filter((m) => (m.phase || 'DV1') === 'DV1')
    const seen = new Set()
    return dv1Rows
      .filter((m) => {
        const k = `${m.name}\0${m.version || '通用'}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .map((m) => ({ name: m.name, version: m.version || '通用' }))
  }, [materials])

  const displayedKeyMaterialKeys = useMemo(() => {
    return filterVersion === '全部' ? keyMaterialKeys : keyMaterialKeys.filter((k) => k.version === filterVersion)
  }, [keyMaterialKeys, filterVersion])

  // 当前阶段下用于表格展示的行（每个 key 一条，无则用占位数据）
  const filteredMaterialsForDisplay = useMemo(() => {
    return displayedKeyMaterialKeys.map((key) => {
      const row = getMaterialRow(key.name, key.version, filterPhase)
      const dv1 = getMaterialRow(key.name, key.version, 'DV1')
      if (row) return { key, row, isPlaceholder: false }
      return {
        key,
        row: {
          id: null,
          name: key.name,
          version: key.version,
          phase: filterPhase,
          supplier: dv1?.supplier || '',
          unit: dv1?.unit || '套',
          riskLevel: dv1?.riskLevel || '无',
          remark: dv1?.remark || '',
          requiredQty: '',
          leadTimeDays: '',
          demandConfirmDate: '',
          eta: '',
          releaseDate: '',
          materialReadyTime: '',
        },
        isPlaceholder: true,
      }
    })
  }, [displayedKeyMaterialKeys, filterPhase, materials])

  const ensureAndUpdateMaterial = (key, phase, field, value) => {
    const dv1 = getMaterialRow(key.name, key.version, 'DV1')
    if (!dv1) return
    const row = getMaterialRow(key.name, key.version, phase)
    if (row) {
      if (field === 'requiredQty' || field === 'receivedQty') updateQty(row.id, field, value)
      else updateMaterial(row.id, field, value)
      // 如果修改了备料周期或开始交料日期，重新计算放行日期
      if (field === 'leadTimeDays' || field === 'eta') {
        const days = field === 'leadTimeDays' ? Math.max(0, parseInt(value, 10) || 0) : (row.leadTimeDays || 0)
        const eta = field === 'eta' ? value : row.eta
        const releaseDate = eta && days > 0 ? addDaysToYmd(eta, -days) : ''
        updateMaterial(row.id, 'releaseDate', releaseDate)
      }
      return
    }
    const num = field === 'requiredQty' || field === 'leadTimeDays' ? Math.max(0, parseInt(value, 10) || 0) : value
    const newLeadTimeDays = field === 'leadTimeDays' ? num : 0
    const newEta = field === 'eta' ? value : ''
    const releaseDate = newEta && newLeadTimeDays > 0 ? addDaysToYmd(newEta, -newLeadTimeDays) : ''
    // 齐料时间默认等于开始交料日期
    const materialReadyTime = newEta || ''
    setMaterials((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${phase}`,
        name: key.name,
        version: key.version,
        phase,
        supplier: dv1.supplier || '',
        unit: dv1.unit || '套',
        riskLevel: dv1.riskLevel || '无',
        remark: dv1.remark || '',
        arrivalTime: '',
        requiredQty: field === 'requiredQty' ? num : 0,
        leadTimeDays: newLeadTimeDays,
        demandConfirmDate: field === 'demandConfirmDate' ? value : '',
        eta: newEta,
        releaseDate,
        materialReadyTime,
      },
    ])
  }

  const deleteMaterialByKey = (key) => {
    if (!window.confirm(`确定删除物料「${key.name}」${key.version !== '通用' ? `（${key.version}）` : ''}？将同时删除其在 EV/DV1/DV2/PV 的数据。`)) return
    setMaterials((prev) => prev.filter((m) => !(m.name === key.name && (m.version || '通用') === key.version)))
  }

  const reorderMaterialsByKeyOrder = (prevMaterials, keyOrder) => {
    const result = []
    keyOrder.forEach((k) => {
      PHASES.forEach((phase) => {
        const row = prevMaterials.find((m) => m.name === k.name && (m.version || '通用') === k.version && (m.phase || 'DV1') === phase)
        if (row) result.push(row)
      })
    })
    return result
  }

  const moveMaterialKey = (key, direction) => {
    const keys = [...keyMaterialKeys]
    const idx = keys.findIndex((k) => k.name === key.name && k.version === key.version)
    if (idx < 0) return
    const toIdx = direction === 'up' ? idx - 1 : idx + 1
    if (toIdx < 0 || toIdx >= keys.length) return
    const next = [...keys]
    ;[next[idx], next[toIdx]] = [next[toIdx], next[idx]]
    setMaterials((prev) => reorderMaterialsByKeyOrder(prev, next))
  }

  const updateMaterialByKey = (key, field, value) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.name === key.name && (m.version || '通用') === key.version ? { ...m, [field]: value } : m
      )
    )
  }

  const updatePhaseStartRange = (type, index, field, value) => {
    setPhaseStartRanges((prev) => ({
      ...prev,
      [type]: prev[type].map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }))
  }

  // 筛选后的列表（按 key 展示时用于兼容统计等，统计仍按全部物料）
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchVersion = filterVersion === '全部' || m.version === filterVersion
      const matchPhase = (m.phase || 'DV1') === filterPhase
      return matchVersion && matchPhase
    })
  }, [materials, filterVersion, filterPhase])

  // 全局统计（关键物料项数 = 以 DV1 为基准的物料键数量）
  const stats = useMemo(() => {
    const totalItems = keyMaterialKeys.length
    let totalRequired = 0
    let riskCount = 0
    materials.forEach((m) => {
      totalRequired += Number(m.requiredQty) || 0
      if (isAtRisk(m)) riskCount += 1
    })
    return { totalItems, totalRequired, riskCount }
  }, [materials, keyMaterialKeys.length])

  // 更新单行字段（数量、名称、版本、颜色、供应商等）
  const updateMaterial = (id, field, value) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const updateQty = (id, field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0)
    updateMaterial(id, field, num)
  }

  const updateLeadTimeDays = (id, value) => {
    const days = Math.max(0, parseInt(value, 10) || 0)
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const eta = m.eta || ''
        const releaseDate = eta ? addDaysToYmd(eta, -days) : ''
        return { ...m, leadTimeDays: days, releaseDate }
      })
    )
  }

  const updateEtaAndRecalcConfirm = (id, eta) => {
    const e = String(eta || '').trim()
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const days = Math.max(0, parseInt(m.leadTimeDays, 10) || 0)
        const releaseDate = e ? addDaysToYmd(e, -days) : ''
        return { ...m, eta: e, releaseDate }
      })
    )
  }

  const updateConfirmAndRecalcEta = (id, confirmDate) => {
    const c = String(confirmDate || '').trim()
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const days = Math.max(0, parseInt(m.leadTimeDays, 10) || 0)
        const eta = c ? addDaysToYmd(c, days) : (m.eta || '')
        return { ...m, demandConfirmDate: c, eta }
      })
    )
  }

  // 删除一行物料
  const deleteMaterial = (id) => {
    if (window.confirm('确定删除该物料项？')) {
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    }
  }

  // 物料行上移/下移
  const moveMaterialRow = (materialIndex, direction) => {
    const toIndex = direction === 'up' ? materialIndex - 1 : materialIndex + 1
    if (toIndex < 0 || toIndex >= materials.length) return
    setMaterials((prev) => {
      const next = [...prev]
      const t = next[materialIndex]
      next[materialIndex] = next[toIndex]
      next[toIndex] = t
      return next
    })
  }

  // 更新样机需求（阶段 × 版本 × 颜色 × 字段）
  const updateProductDemand = (phase, version, color, field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0)
    const prev = productDemandsRef.current ?? productDemands
    const next = {
      ...prev,
      [phase]: {
        ...prev[phase],
        [version]: {
          ...(prev[phase] && prev[phase][version] ? prev[phase][version] : {}),
          [color]: {
            ...(prev[phase]?.[version]?.[color] || { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }),
            [field]: num,
          },
        },
      },
    }
    productDemandsRef.current = next
    setProductDemands(next)
  }

  // 固定实际需求数量，输入试产良率后反算主板投产数量：主板投产数量 = ceil(实际需求数量 / (良率%/100))
  const updateProductDemandByYield = (phase, version, color, yieldPctStr) => {
    const pct = Math.min(100, Math.max(0, parseInt(yieldPctStr, 10) || 0))
    const prev = productDemandsRef.current ?? productDemands
    const cell = prev[phase]?.[version]?.[color] || { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
    const actual = Number(cell.actualDemand) || 0
    const newPutIn = pct > 0 && actual > 0 ? Math.ceil(actual / (pct / 100)) : (Number(cell.putInQty) || 0)
    const next = {
      ...prev,
      [phase]: {
        ...prev[phase],
        [version]: {
          ...(prev[phase]?.[version] || {}),
          [color]: { ...cell, putInQty: newPutIn },
        },
      },
    }
    productDemandsRef.current = next
    setProductDemands(next)
  }

  // 添加产品颜色列（仅当前阶段）
  const addProductColor = (phase) => {
    const name = window.prompt('输入新颜色名称', '新颜色')
    if (!name || !name.trim()) return
    const trimmed = name.trim()
    const colors = productColorsByPhase[phase] || []
    if (colors.includes(trimmed)) {
      window.alert('该阶段下该颜色已存在')
      return
    }
    setProductColorsByPhase((prev) => {
      const next = { ...prev, [phase]: [...(prev[phase] || []), trimmed] }
      productColorsByPhaseRef.current = next
      return next
    })
    setProductDemands((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (!next[phase]) next[phase] = {}
      DEMAND_VERSION_KEYS.forEach((ver) => {
        if (!next[phase][ver]) next[phase][ver] = {}
        next[phase][ver][trimmed] = { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
      })
      productDemandsRef.current = next
      return next
    })
  }

  // 重命名产品颜色（仅当前阶段）
  const renameProductColor = (phase, oldName, newName) => {
    const trimmed = (newName || '').trim()
    if (!trimmed || trimmed === oldName) return
    const colors = productColorsByPhase[phase] || []
    if (colors.some((c) => c !== oldName && c === trimmed)) {
      window.alert('该阶段下该颜色名称已存在')
      return
    }
    setProductColorsByPhase((prev) => {
      const next = { ...prev, [phase]: (prev[phase] || []).map((c) => (c === oldName ? trimmed : c)) }
      productColorsByPhaseRef.current = next
      return next
    })
    setProductDemands((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (!next[phase]) return prev
      DEMAND_VERSION_KEYS.forEach((ver) => {
        if (next[phase][ver] && oldName in next[phase][ver]) {
          next[phase][ver][trimmed] = next[phase][ver][oldName]
          delete next[phase][ver][oldName]
        }
      })
      productDemandsRef.current = next
      return next
    })
  }

  // 删除产品颜色列（仅当前阶段）
  const removeProductColor = (phase, color) => {
    const colors = productColorsByPhase[phase] || []
    if (colors.length <= 1) {
      window.alert('至少保留一个颜色')
      return
    }
    if (!window.confirm(`确定在该阶段删除颜色「${color}」？`)) return
    setProductColorsByPhase((prev) => {
      const next = { ...prev, [phase]: (prev[phase] || []).filter((c) => c !== color) }
      productColorsByPhaseRef.current = next
      return next
    })
    setProductDemands((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (!next[phase]) return prev
      DEMAND_VERSION_KEYS.forEach((ver) => {
        if (next[phase][ver]) delete next[phase][ver][color]
      })
      productDemandsRef.current = next
      return next
    })
  }

  // 添加新物料（EV/DV1/DV2/PV 各一条，便于四阶段同表编辑）
  const addMaterial = () => {
    if (!newItem.name.trim()) return
    const days = Number(newItem.leadTimeDays) || 0
    const eta = newItem.eta || ''
    const releaseDate = eta && days > 0 ? addDaysToYmd(eta, -days) : ''
    const base = {
      name: newItem.name.trim(),
      version: newItem.version || '通用',
      supplier: newItem.supplier || '',
      unit: newItem.unit || '套',
      riskLevel: newItem.riskLevel || '无',
      remark: newItem.remark || '',
      arrivalTime: newItem.arrivalTime || '',
      requiredQty: Number(newItem.requiredQty) || 0,
      leadTimeDays: days,
      eta: eta,
      releaseDate: releaseDate,
      materialReadyTime: '',
    }
    setMaterials((prev) => [
      ...prev,
      ...PHASES.map((p) => ({ ...base, id: `m_${Date.now()}_${p}`, phase: p })),
    ])
    setNewItem({
      name: '',
      version: '通用',
      phase: filterPhase,
      supplier: '',
      unit: '套',
      riskLevel: '无',
      remark: '',
      arrivalTime: '',
      requiredQty: 0,
      leadTimeDays: 0,
      eta: new Date().toISOString().slice(0, 10),
      releaseDate: '',
      materialReadyTime: '',
    })
    setModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 页面标题 */}
      <title>耳机项目跟进管理系统</title>
      {/* 项目列表页 */}
      {view === 'list' && (
        <>
          <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-800">耳机项目跟进管理系统</h1>
            <p className="text-sm text-slate-500 mt-0.5">选择项目或新建项目</p>
          </header>
          <main className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={handleNewProject}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                新建项目
              </button>
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                导出/备份
              </button>
              <button
                type="button"
                onClick={handleRestoreFromBackup}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                从备份恢复
              </button>
            </div>
            {projects.length === 0 ? (
              <p className="text-slate-500">暂无已保存的项目，点击「新建项目」开始</p>
            ) : (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderOpen className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{p.name || p.projectName || '未命名项目'}</p>
                        <p className="text-xs text-slate-500">
                          保存于 {p.savedAt ? new Date(p.savedAt).toLocaleString('zh-CN') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenProject(p)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        打开
                      </button>
                      <button
                        onClick={() => handleCopyProject(p)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        复制
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </>
      )}

      {/* 编辑页：项目名称 + 保存 + 返回 */}
      {view === 'editor' && (
        <>
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {projectProductImage && (
              <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                <img src={projectProductImage} alt="产品图" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="项目名称"
                className="rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold text-slate-800 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                <span>上传产品图</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const r = new FileReader()
                    r.onload = () => setProjectProductImage(r.result)
                    r.readAsDataURL(f)
                  }}
                />
              </label>
              {projectProductImage && (
                <button type="button" onClick={() => setProjectProductImage(null)} className="text-slate-400 hover:text-red-600 text-sm">清除图片</button>
              )}
            </div>
            <input
              type="text"
              value={mdrNumber}
              onChange={(e) => setMdrNumber(e.target.value)}
              placeholder="MDR号"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => { setShowInternalVersionModal(true); setInternalVersionValue(internalVersion) }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 min-w-[120px] text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
              title={internalVersion || '点击输入内部版本号'}
            >
              {internalVersion || <span className="text-slate-400">内部版本号</span>}
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              返回
            </button>
            <span className="w-px h-6 bg-slate-200 mx-1"></span>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowWorkbook(false); setShowProductSpec(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Box className="w-3.5 h-3.5" />
              产品规格
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowWorkbook(false); setShowProductSpec(false); setShowDistributionList(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              样机分发
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectMembers(false); setShowWorkbook(false); setShowProductSpec(false); setShowProjectPlan(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              项目计划
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowWorkbook(false); setShowProductSpec(false); setShowProjectMembers(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              项目成员
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(true); setShowWorkbook(false) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              技术储备
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(false); setShowWorkbook(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              项目问题点
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(false); setShowWorkbook(false); setShowTrialIssues(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              试产问题点
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(false); setShowWorkbook(false); setShowTrialIssues(false); setShowFileLibrary(true) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              文件资料
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">NPI 试产阶段核心物料齐套进度</p>
      </header>

      {showProductSpec ? (
        /* 产品规格页面 - 与外部一致的浅色 UI，表单可选择/输入 */
        <main className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProductSpec(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-lg font-semibold text-slate-800">产品规格</h2>
            </div>
            <div className="flex items-center gap-3">
              {productSpecSaveHint && (
                <span className="text-sm text-emerald-600">已保存</span>
              )}
              <button
                type="button"
                onClick={() => { handleSave(); setProductSpecSaveHint(true); setTimeout(() => setProductSpecSaveHint(false), 2000) }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                保存到当前项目
              </button>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-6">填写耳机产品规格，便于项目对齐与评审。以下项均可选择或输入，保存后写入当前项目。</p>

          {/* 1. 版本架构 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">版本架构说明 (Version Architecture)</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">版本策略</label>
                <select
                  value={productSpec.versionStrategy}
                  onChange={(e) => setProductSpec((s) => ({ ...s, versionStrategy: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {VERSION_STRATEGIES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">不可拆版通过电池支架与可拆版声学对齐，腔体容积与频响一致。</p>
              </div>
              {productSpec.versionStrategy === '双版本可选' && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">两版本差异点信息</label>
                  <textarea
                    value={productSpec.versionDifferences || ''}
                    onChange={(e) => setProductSpec((s) => ({ ...s, versionDifferences: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
                    placeholder="请填写标准版与可持续版的主要差异，例如：标准版电池不可拆、内置电池支架；可持续版电池可拆换、环保合规；以及结构、标识、包装等差异…"
                  />
                  <p className="text-xs text-slate-500 mt-1">选双版本时必填，便于项目与客户对齐标准版、可持续版的区别。</p>
                </div>
              )}
            </div>
          </section>

          {/* 2. 交互与感应 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Hand className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">交互与感应系统 (Interaction & Sensing)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">触控方式</label>
                <select
                  value={productSpec.touchControl}
                  onChange={(e) => setProductSpec((s) => ({ ...s, touchControl: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {TOUCH_CONTROLS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">开盖即连（霍尔传感器）</label>
                <select
                  value={productSpec.openToConnect}
                  onChange={(e) => setProductSpec((s) => ({ ...s, openToConnect: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {YES_NO.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">入耳检测 (Wear Detection)</label>
                <select
                  value={productSpec.wearDetection}
                  onChange={(e) => setProductSpec((s) => ({ ...s, wearDetection: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {WEAR_DETECTIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 3. 音频与通话 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">音频与通话性能 (Audio & Call Quality)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">发声单元</label>
                <select
                  value={productSpec.driverType}
                  onChange={(e) => setProductSpec((s) => ({ ...s, driverType: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {DRIVER_TYPES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">抗风噪优化（0° 迎风）</label>
                <select
                  value={productSpec.windNoiseOptimized}
                  onChange={(e) => setProductSpec((s) => ({ ...s, windNoiseOptimized: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {YES_NO.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">音频编码</label>
                <select
                  value={productSpec.audioCodec}
                  onChange={(e) => setProductSpec((s) => ({ ...s, audioCodec: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {AUDIO_CODECS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 4. 物理特性与 ID 规格 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">物理特性与细节 (Mechanical & ID Specs)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">防水等级</label>
                <select
                  value={productSpec.waterproof}
                  onChange={(e) => setProductSpec((s) => ({ ...s, waterproof: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {WATERPROOF_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">挂绳孔（哈曼 ID）</label>
                <select
                  value={productSpec.lanyardHole}
                  onChange={(e) => setProductSpec((s) => ({ ...s, lanyardHole: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {YES_NO.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">保护塞直径 (mm)</label>
                <input
                  type="text"
                  value={productSpec.plugDiameter}
                  onChange={(e) => setProductSpec((s) => ({ ...s, plugDiameter: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 3.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">L/R 标识字高 (mm)</label>
                <input
                  type="text"
                  value={productSpec.lrMarkHeight}
                  onChange={(e) => setProductSpec((s) => ({ ...s, lrMarkHeight: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 1.65"
                />
              </div>
            </div>
          </section>

          {/* 基础参数（产品类型、芯片、电池、蓝牙、续航等） */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">基础参数</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">产品类型</label>
                <select
                  value={productSpec.productType}
                  onChange={(e) => setProductSpec((s) => ({ ...s, productType: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">芯片型号</label>
                <input
                  type="text"
                  value={productSpec.chipModel}
                  onChange={(e) => setProductSpec((s) => ({ ...s, chipModel: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 QCC3086、BES2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">耳机电池容量</label>
                <input
                  type="text"
                  value={productSpec.earbudBattery}
                  onChange={(e) => setProductSpec((s) => ({ ...s, earbudBattery: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 30mAh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">充电盒电池容量</label>
                <input
                  type="text"
                  value={productSpec.caseBattery}
                  onChange={(e) => setProductSpec((s) => ({ ...s, caseBattery: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 400mAh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">蓝牙版本</label>
                <select
                  value={productSpec.bluetoothVersion}
                  onChange={(e) => setProductSpec((s) => ({ ...s, bluetoothVersion: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {BLUETOOTH_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">单次续航（耳机）</label>
                <input
                  type="text"
                  value={productSpec.playbackTime}
                  onChange={(e) => setProductSpec((s) => ({ ...s, playbackTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 约6小时"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">充电盒可充电次数</label>
                <input
                  type="text"
                  value={productSpec.caseCharges}
                  onChange={(e) => setProductSpec((s) => ({ ...s, caseCharges: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如 约4次"
                />
              </div>
            </div>
          </section>

          {/* 备注 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">项目备注</h3>
              <p className="text-xs text-slate-500 mt-0.5">可补充与当前项目相关的规格说明</p>
            </div>
            <div className="p-4">
              <textarea
                value={productSpec.remark}
                onChange={(e) => setProductSpec((s) => ({ ...s, remark: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                placeholder="其他规格或项目相关说明…"
              />
            </div>
          </section>
        </main>
      ) : showDistributionList ? (
        /* 样机分发登记清单页面 */
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDistributionList(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-lg font-semibold text-slate-800">样机分发登记清单</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">样品阶段：</span>
              {DISTRIBUTION_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDistributionStageFilter(s)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    distributionStageFilter === s ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setDistributionSaveHint(true); setTimeout(() => setDistributionSaveHint(false), 2000) }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={exportDistributionExcel}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                导出 Excel
              </button>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                导入 Excel
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importDistributionExcel} />
              </label>
              <button
                onClick={addDistributionRow}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                增加行
              </button>
            </div>
          </div>
          {distributionSaveHint && (
            <p className="text-sm text-emerald-600 mb-4">已保存，数据已更新</p>
          )}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="text-left py-3 px-3 font-medium">耳机(套)</th>
                    <th className="text-left py-3 px-3 font-medium">充电盒</th>
                    <th className="text-left py-3 px-3 font-medium">PCBA</th>
                    <th className="text-left py-3 px-3 font-medium">耳机结构手板</th>
                    <th className="text-left py-3 px-3 font-medium">颜色</th>
                    <th className="text-left py-3 px-3 font-medium">公司</th>
                    <th className="text-left py-3 px-3 font-medium">领用人</th>
                    <th className="text-left py-3 px-3 font-medium">负责人</th>
                    <th className="text-left py-3 px-3 font-medium">领用时间</th>
                    <th className="text-left py-3 px-3 font-medium">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributionRecords.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input type="text" value={row.earphoneSet || ''} onChange={(e) => updateDistributionRecord(row.id, 'earphoneSet', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" placeholder="套" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.charging || ''} onChange={(e) => updateDistributionRecord(row.id, 'charging', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.pcba || ''} onChange={(e) => updateDistributionRecord(row.id, 'pcba', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.structureHand || ''} onChange={(e) => updateDistributionRecord(row.id, 'structureHand', e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.color || ''} onChange={(e) => updateDistributionRecord(row.id, 'color', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" placeholder="颜色" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.company || ''} onChange={(e) => updateDistributionRecord(row.id, 'company', e.target.value)} className="w-28 rounded border border-slate-300 px-2 py-1" placeholder="公司" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.recipient || ''} onChange={(e) => updateDistributionRecord(row.id, 'recipient', e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1" placeholder="领用人" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.personInCharge || ''} onChange={(e) => updateDistributionRecord(row.id, 'personInCharge', e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1" placeholder="负责人" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="date" value={row.receiptTime || ''} onChange={(e) => updateDistributionRecord(row.id, 'receiptTime', e.target.value)} className="w-32 rounded border border-slate-300 px-2 py-1" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.remark || ''} onChange={(e) => updateDistributionRecord(row.id, 'remark', e.target.value)} className="w-32 rounded border border-slate-300 px-2 py-1" placeholder="备注" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {filteredDistributionRecords.length > 0 && (
                <tfoot>
                  <tr className="bg-emerald-50 border-t-2 border-emerald-200 font-medium text-slate-800">
                    <td className="py-2.5 px-3 text-center tabular-nums text-emerald-700">
                      {filteredDistributionRecords.reduce((s, r) => s + (Number(r.earphoneSet) || 0), 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-emerald-700">
                      {filteredDistributionRecords.reduce((s, r) => s + (Number(r.charging) || 0), 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-emerald-700">
                      {filteredDistributionRecords.reduce((s, r) => s + (Number(r.pcba) || 0), 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-emerald-700">
                      {filteredDistributionRecords.reduce((s, r) => s + (Number(r.structureHand) || 0), 0)}
                    </td>
                    <td colSpan={5}></td>
                    <td className="py-2.5 px-3 text-sm font-semibold text-emerald-800 text-right">合计</td>
                  </tr>
                </tfoot>
                )}
              </table>
            </div>
            {filteredDistributionRecords.length === 0 && (
              <div className="py-12 text-center text-slate-500">当前阶段暂无登记，点击「增加行」添加</div>
            )}
          </div>
        </main>
      ) : showProjectPlan ? (
        <ProjectPlanPage
          projectName={projectName}
          onBack={() => setShowProjectPlan(false)}
          onSave={handleSave}
          planPages={planPages}
          ganttPlans={ganttPlans}
          onPlanPagesChange={setPlanPages}
          onGanttPlansChange={setGanttPlans}
          initialMilestones={projectPlanMilestones}
          initialColumns={projectPlanColumns}
          initialCells={projectPlanCells}
          initialComments={projectPlanComments}
          onMilestonesChange={setProjectPlanMilestones}
          onColumnsChange={setProjectPlanColumns}
          onCellsChange={setProjectPlanCells}
          onCommentsChange={setProjectPlanComments}
        />
      ) : showProjectMembers ? (
        /* 项目成员页面 */
        <main className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProjectMembers(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-lg font-semibold text-slate-800">项目成员</h2>
            </div>
            <button
              onClick={() => { handleSave(); setProjectMembersSaveHint(true); setTimeout(() => setProjectMembersSaveHint(false), 2000) }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={exportMembersExcel}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              导出 Excel
            </button>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              导入 Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importMembersExcel} />
            </label>
          </div>
          {projectMembersSaveHint && (
            <p className="text-sm text-emerald-600 mb-4">已保存，数据已更新</p>
          )}

          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700">客户项目团队成员</h3>
              <button
                onClick={addCustomerMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" /> 增加行
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-600 text-white">
                      <th className="text-left py-2.5 px-3 font-medium">职位</th>
                      <th className="text-left py-2.5 px-3 font-medium">名称</th>
                      <th className="text-left py-2.5 px-3 font-medium">邮件</th>
                      <th className="text-left py-2.5 px-3 font-medium">电话</th>
                      <th className="text-left py-2.5 px-3 font-medium">备注</th>
                      <th className="text-left py-2.5 px-3 font-medium w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerTeamMembers.map((m, idx) => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3"><input type="text" value={m.role || ''} onChange={(e) => updateCustomerMember(m.id, 'role', e.target.value)} className="w-full min-w-[100px] rounded border border-slate-300 px-2 py-1" placeholder="职位" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.name || ''} onChange={(e) => updateCustomerMember(m.id, 'name', e.target.value)} className="w-full min-w-[80px] rounded border border-slate-300 px-2 py-1" placeholder="名称" /></td>
                        <td className="py-2 px-3"><input type="email" value={m.email || ''} onChange={(e) => updateCustomerMember(m.id, 'email', e.target.value)} className="w-full min-w-[160px] rounded border border-slate-300 px-2 py-1" placeholder="邮件" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.phone || ''} onChange={(e) => updateCustomerMember(m.id, 'phone', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="电话" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.remark || ''} onChange={(e) => updateCustomerMember(m.id, 'remark', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="备注" /></td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveCustomerMemberUp(m.id)} disabled={idx === 0} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30" title="上移"><ChevronUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveCustomerMemberDown(m.id)} disabled={idx === customerTeamMembers.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30" title="下移"><ChevronDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => deleteCustomerMember(m.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title="删除"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {customerTeamMembers.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">暂无成员，点击「增加行」添加</div>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700">内部项目成员</h3>
              <button
                onClick={addInternalMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" /> 增加行
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-600 text-white">
                      <th className="text-left py-2.5 px-3 font-medium">职位</th>
                      <th className="text-left py-2.5 px-3 font-medium">名称</th>
                      <th className="text-left py-2.5 px-3 font-medium">邮件</th>
                      <th className="text-left py-2.5 px-3 font-medium">电话</th>
                      <th className="text-left py-2.5 px-3 font-medium">备注</th>
                      <th className="text-left py-2.5 px-3 font-medium w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internalMembers.map((m, idx) => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3"><input type="text" value={m.role || ''} onChange={(e) => updateInternalMember(m.id, 'role', e.target.value)} className="w-full min-w-[100px] rounded border border-slate-300 px-2 py-1" placeholder="职位" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.name || ''} onChange={(e) => updateInternalMember(m.id, 'name', e.target.value)} className="w-full min-w-[80px] rounded border border-slate-300 px-2 py-1" placeholder="名称" /></td>
                        <td className="py-2 px-3"><input type="email" value={m.email || ''} onChange={(e) => updateInternalMember(m.id, 'email', e.target.value)} className="w-full min-w-[160px] rounded border border-slate-300 px-2 py-1" placeholder="邮件" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.phone || ''} onChange={(e) => updateInternalMember(m.id, 'phone', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="电话" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.remark || ''} onChange={(e) => updateInternalMember(m.id, 'remark', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="备注" /></td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveInternalMemberUp(m.id)} disabled={idx === 0} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30" title="上移"><ChevronUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveInternalMemberDown(m.id)} disabled={idx === internalMembers.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30" title="下移"><ChevronDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => deleteInternalMember(m.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title="删除"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {internalMembers.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">暂无成员，点击「增加行」添加</div>}
            </div>
          </section>
        </main>
      ) : showTechReserve ? (
        /* 技术储备页面 */
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTechReserve(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-base font-semibold text-slate-800">技术储备</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setTechReserveSaveHint(true); setTimeout(() => setTechReserveSaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
          {techReserveSaveHint && (
            <p className="text-sm text-emerald-600 mb-3">已保存，数据已更新</p>
          )}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* 左侧：模块与条目列表 */}
            <aside className="md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/60">
              <div className="p-3 border-b border-slate-200">
                <div className="flex flex-wrap gap-1">
                  {TECH_MODULES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setTechActiveModule(m); setTechActiveId(null) }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        techActiveModule === m ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    placeholder="搜索名词 / 标签"
                    className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTechEntry(techActiveModule)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增
                  </button>
                </div>
              </div>
              <div className="p-2 max-h-[480px] overflow-y-auto">
                {(() => {
                  const q = techSearch.trim().toLowerCase()
                  // 当有搜索关键字时，在所有模块中搜索；否则只看当前模块
                  const baseList = q
                    ? TECH_MODULES.flatMap((mod) =>
                        (techReserve[mod] || []).map((e) => ({ ...e, _module: mod })),
                      )
                    : (techReserve[techActiveModule] || []).map((e) => ({ ...e, _module: techActiveModule }))

                  const filtered = baseList.filter((e) => {
                    if (!q) return true
                    return (
                      String(e.term || '').toLowerCase().includes(q) ||
                      String(e.summary || '').toLowerCase().includes(q) ||
                      String(e.tags || '').toLowerCase().includes(q)
                    )
                  })
                  if (filtered.length === 0) {
                    return <p className="text-xs text-slate-400 px-2 py-4">暂无匹配记录，可点击右上角「新增」添加。</p>
                  }
                  const activeId = techActiveId && filtered.some((e) => e.id === techActiveId)
                    ? techActiveId
                    : filtered[0].id
                  return filtered.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setTechActiveModule(e._module || techActiveModule)
                        setTechActiveId(e.id)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-xs ${
                        activeId === e.id
                          ? 'bg-slate-800 text-white'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate">{e.term || '未命名名词'}</span>
                        {e._module && (
                          <span className={`ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] ${
                            activeId === e.id ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {e._module}
                          </span>
                        )}
                      </div>
                      {e.summary && (
                        <div className={`mt-0.5 text-[11px] ${activeId === e.id ? 'text-slate-200' : 'text-slate-500'}`}>
                          {e.summary}
                        </div>
                      )}
                    </button>
                  ))
                })()}
              </div>
            </aside>

            {/* 右侧：详情编辑 */}
            <section className="flex-1 p-4 space-y-4">
              {(() => {
                const list = techReserve[techActiveModule] || []
                if (list.length === 0) {
                  return <p className="text-sm text-slate-400">当前模块暂无技术储备，点击左侧「新增」开始记录。</p>
                }
                const active = list.find((e) => e.id === techActiveId) || list[0]
                if (!active) {
                  return <p className="text-sm text-slate-400">请选择左侧的一条记录进行编辑。</p>
                }
                const onFieldChange = (field, value) => updateTechEntry(techActiveModule, active.id, field, value)
                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-800">名词 / 技术点</h3>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {techActiveModule}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={active.term || ''}
                          onChange={(e) => onFieldChange('term', e.target.value)}
                          placeholder="如：ANC 前馈/反馈、堆叠公差、RF 互调等"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTechEntry(techActiveModule, active.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        删除
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">一句话解释</label>
                        <textarea
                          value={active.summary || ''}
                          onChange={(e) => onFieldChange('summary', e.target.value)}
                          placeholder="简要说明该技术点的定义或作用，方便快速扫一眼理解。"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs min-h-[72px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">适用阶段 / 模块标签</label>
                        <input
                          type="text"
                          value={active.phaseScope || ''}
                          onChange={(e) => onFieldChange('phaseScope', e.target.value)}
                          placeholder="如：EV/DV1、整机 RF 验证、声学调校前期等"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="block text-xs font-medium text-slate-600 mt-2 mb-1">标签</label>
                        <input
                          type="text"
                          value={active.tags || ''}
                          onChange={(e) => onFieldChange('tags', e.target.value)}
                          placeholder="用逗号分隔，如：参数, 风险点, 验证方法"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">详细说明</label>
                      <RichTextEditor
                        value={active.details || ''}
                        onChange={(html) => onFieldChange('details', html)}
                        placeholder="描述技术原理、关键参数、与产品的关系等。可用小段落或列点，可粘贴图片。"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">经验要点 / 常见问题</label>
                      <textarea
                        value={active.notes || ''}
                        onChange={(e) => onFieldChange('notes', e.target.value)}
                        placeholder="记录以往项目踩过的坑、Checklist、注意事项、典型问题案例等。"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>负责人/来源：</span>
                        <input
                          type="text"
                          value={active.owner || ''}
                          onChange={(e) => onFieldChange('owner', e.target.value)}
                          placeholder="如：声学专家A / 某评审会议"
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      {active.updatedAt && (
                        <span>最近更新：{new Date(active.updatedAt).toLocaleString('zh-CN')}</span>
                      )}
                    </div>
                  </>
                )
              })()}
            </section>
          </div>
        </main>
      ) : showWorkbook ? (
        /* 项目问题点页面 */
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWorkbook(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-base font-semibold text-slate-800">项目问题点</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setWorkbookSaveHint(true); setTimeout(() => setWorkbookSaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={exportWorkbookToExcel}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-amber-700"
              >
                <BookOpen className="w-4 h-4" />
                导出 Excel
              </button>
            </div>
          </div>
          {workbookSaveHint && (
            <p className="text-sm text-emerald-600 mb-3">已保存，数据已更新</p>
          )}
          <p className="text-slate-600 text-sm mb-4">按分类记录项目中发现的问题，Actions or Details 可定期输入更新。</p>
          <div className="space-y-6">
            {WORKBOOK_CATEGORIES.map((category) => (
              <section key={category} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-600 text-white">
                  <h3 className="text-sm font-semibold">{category}</h3>
                  <button
                    type="button"
                    onClick={() => addWorkbookEntry(category)}
                    className="rounded border border-white/50 px-2 py-1 text-xs font-medium hover:bg-white/10"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> 添加问题点
                  </button>
                </div>
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="pb-2 pr-2 font-medium w-8">#</th>
                        <th className="pb-2 font-medium min-w-[180px]">Actions or Details</th>
                        <th className="pb-2 font-medium w-24">责任人</th>
                        <th className="pb-2 font-medium w-32">问题提出时间</th>
                        <th className="pb-2 font-medium w-20">风险程度</th>
                        <th className="pb-2 pl-2 font-medium w-16">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(workbookEntries[category] || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">暂无记录，点击「添加问题点」添加</td>
                        </tr>
                      ) : (
                        (workbookEntries[category] || []).map((entry, idx) => (
                          <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-1.5 pr-2 text-slate-400 align-top">{idx + 1}</td>
                            <td className="py-1.5 align-top">
                              <div className="flex items-start gap-1">
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => { setWorkbookDetailModal({ category, entryId: entry.id }); setWorkbookDetailContent(entry.content || '') }}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setWorkbookDetailModal({ category, entryId: entry.id }); setWorkbookDetailContent(entry.content || '') } }}
                                  className="flex-1 min-w-0 rounded border border-slate-300 px-2 py-1.5 text-slate-800 text-xs text-left cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none min-h-[36px] max-h-[120px] overflow-hidden line-clamp-4"
                                >
                                  {(entry.content || '').trim() || <span className="text-slate-400">输入问题描述或跟进措施… 点击放大编辑</span>}
                                </div>
                                <button type="button" onClick={() => { setWorkbookDetailModal({ category, entryId: entry.id }); setWorkbookDetailContent(entry.content || '') }} className="shrink-0 p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="放大预览/编辑"><Maximize2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                            <td className="py-1.5 align-top">
                              <input
                                type="text"
                                value={entry.responsiblePerson || ''}
                                onChange={(e) => updateWorkbookEntry(category, entry.id, 'responsiblePerson', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                placeholder="责任人"
                              />
                            </td>
                            <td className="py-1.5 align-top">
                              <input
                                type="date"
                                value={entry.raisedTime || ''}
                                onChange={(e) => updateWorkbookEntry(category, entry.id, 'raisedTime', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="py-1.5 align-top">
                              <select
                                value={entry.riskLevel || '无'}
                                onChange={(e) => updateWorkbookEntry(category, entry.id, 'riskLevel', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                              >
                                {RISK_LEVELS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-1.5 pl-2 align-top">
                              <button type="button" onClick={() => deleteWorkbookEntry(category, entry.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title="删除"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </main>
      ) : showTrialIssues ? (
        /* 试产问题点页面 */
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTrialIssues(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-base font-semibold text-slate-800">试产问题点</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setTrialIssuesSaveHint(true); setTimeout(() => setTrialIssuesSaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
          {trialIssuesSaveHint && (
            <p className="text-sm text-emerald-600 mb-3">已保存，数据已更新</p>
          )}
          <p className="text-slate-600 text-sm mb-4">按 DV1/DV2/PV 阶段记录试产中发现的问题，跟踪处理进度。</p>
          
          {/* 阶段切换 */}
          <div className="flex items-center gap-2 mb-4">
            {['DV1', 'DV2', 'PV'].map((phase) => (
              <button
                key={phase}
                onClick={() => setTrialIssuesPhase(phase)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  trialIssuesPhase === phase
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
          
          {/* 添加按钮 */}
          <div className="mb-4">
            <button
              onClick={() => {
                setEditingTrialIssue(null)
                setTrialIssueForm({
                  removable: '可拆',
                  category: '生产',
                  phenomenon: '',
                  cause: '',
                  solution: '',
                  owner: '',
                  priority: '中',
                  closeTime: '',
                  status: '待处理'
                })
                setTrialIssueModal(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"
            >
              <Plus className="w-4 h-4" />
              添加问题点
            </button>
          </div>
          
          {/* 问题点列表 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2 pr-2 font-medium w-8">#</th>
                    <th className="pb-2 font-medium w-20">可拆/不可拆</th>
                    <th className="pb-2 font-medium w-24">分类</th>
                    <th className="pb-2 font-medium min-w-[180px]">现象</th>
                    <th className="pb-2 font-medium min-w-[150px]">原因</th>
                    <th className="pb-2 font-medium min-w-[150px]">解决措施</th>
                    <th className="pb-2 font-medium w-24">负责人</th>
                    <th className="pb-2 font-medium w-20">优先级</th>
                    <th className="pb-2 font-medium w-20">状态</th>
                    <th className="pb-2 font-medium w-32">收尾时间</th>
                    <th className="pb-2 pl-2 font-medium w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {(trialIssues[trialIssuesPhase] || []).length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-slate-400 text-xs">暂无记录，点击「添加问题点」添加</td>
                    </tr>
                  ) : (
                    (trialIssues[trialIssuesPhase] || [])
                      .sort((a, b) => {
                        // 先按可拆/不可拆排序（可拆在前）
                        if (a.removable !== b.removable) {
                          return a.removable === '可拆' ? -1 : 1
                        }
                        // 再按分类排序
                        const aIdx = TRIAL_ISSUE_CATEGORIES.indexOf(a.category)
                        const bIdx = TRIAL_ISSUE_CATEGORIES.indexOf(b.category)
                        if (aIdx !== bIdx) return aIdx - bIdx
                        return 0
                      })
                      .map((issue, idx) => (
                      <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer" onClick={() => { 
                        setEditingTrialIssue(issue)
                        setTrialIssueForm({
                          removable: issue.removable || '可拆',
                          category: issue.category || '生产',
                          phenomenon: issue.phenomenon || '',
                          cause: issue.cause || '',
                          solution: issue.solution || '',
                          owner: issue.owner || '',
                          priority: issue.priority || '中',
                          closeTime: issue.closeTime || '',
                          status: issue.status || '待处理'
                        })
                        setTrialIssueModal(true) 
                      }}>
                        <td className="py-2 pr-2 text-slate-400 align-top">{idx + 1}</td>
                        <td className="py-2 align-top">
                          <span className="text-xs text-slate-600">{issue.removable || '可拆'}</span>
                        </td>
                        <td className="py-2 align-top">
                          <span className="text-xs text-slate-600">{issue.category || '生产'}</span>
                        </td>
                        <td className="py-2 align-top">
                          <div className="text-slate-800 text-xs line-clamp-2">{issue.phenomenon || '-'}</div>
                        </td>
                        <td className="py-2 align-top">
                          <div className="text-slate-800 text-xs line-clamp-2">{issue.cause || '-'}</div>
                        </td>
                        <td className="py-2 align-top">
                          <div className="text-slate-800 text-xs line-clamp-2">{issue.solution || '-'}</div>
                        </td>
                        <td className="py-2 align-top">
                          <span className="text-xs text-slate-600">{issue.owner || '-'}</span>
                        </td>
                        <td className="py-2 align-top">
                          <span className={`text-xs ${issue.priority === '高' ? 'text-red-600' : issue.priority === '中' ? 'text-amber-600' : 'text-slate-600'}`}>{issue.priority || '中'}</span>
                        </td>
                        <td className="py-2 align-top">
                          <span className={`text-xs ${issue.status === '已解决' ? 'text-emerald-600' : issue.status === '处理中' ? 'text-blue-600' : 'text-slate-600'}`}>{issue.status || '待处理'}</span>
                        </td>
                        <td className="py-2 align-top">
                          <span className="text-xs text-slate-600">{issue.closeTime || '-'}</span>
                        </td>
                        <td className="py-2 pl-2 align-top" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => deleteTrialIssue(issue.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 添加/编辑问题点弹窗 */}
          {trialIssueModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setTrialIssueModal(false)}>
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">{editingTrialIssue ? '编辑问题点' : '添加问题点'} - {trialIssuesPhase}</h2>
                  <button onClick={() => { setTrialIssueModal(false); setEditingTrialIssue(null) }} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">可拆/不可拆</label>
                      <select
                        value={trialIssueForm.removable}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, removable: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="可拆">可拆</option>
                        <option value="不可拆">不可拆</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">分类</label>
                      <select
                        value={trialIssueForm.category}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {TRIAL_ISSUE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">现象</label>
                    <textarea
                      value={trialIssueForm.phenomenon}
                      onChange={(e) => setTrialIssueForm((p) => ({ ...p, phenomenon: e.target.value }))}
                      placeholder="描述问题现象..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">原因</label>
                    <textarea
                      value={trialIssueForm.cause}
                      onChange={(e) => setTrialIssueForm((p) => ({ ...p, cause: e.target.value }))}
                      placeholder="分析问题原因..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">解决措施</label>
                    <textarea
                      value={trialIssueForm.solution}
                      onChange={(e) => setTrialIssueForm((p) => ({ ...p, solution: e.target.value }))}
                      placeholder="输入解决措施..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">负责人</label>
                      <input
                        type="text"
                        value={trialIssueForm.owner}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, owner: e.target.value }))}
                        placeholder="负责人姓名"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">优先级</label>
                      <select
                        value={trialIssueForm.priority}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, priority: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="高">高</option>
                        <option value="中">中</option>
                        <option value="低">低</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">状态</label>
                      <select
                        value={trialIssueForm.status}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, status: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="待处理">待处理</option>
                        <option value="处理中">处理中</option>
                        <option value="已解决">已解决</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">收尾时间</label>
                      <input
                        type="date"
                        value={trialIssueForm.closeTime}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, closeTime: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setTrialIssueModal(false)
                      setEditingTrialIssue(null)
                      setTrialIssueForm({
                        removable: '可拆',
                        category: '生产',
                        phenomenon: '',
                        cause: '',
                        solution: '',
                        owner: '',
                        priority: '中',
                        closeTime: '',
                        status: '待处理'
                      })
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (editingTrialIssue) {
                        // 更新现有问题点
                        setTrialIssues((prev) => ({
                          ...prev,
                          [trialIssuesPhase]: (prev[trialIssuesPhase] || []).map((e) =>
                            e.id === editingTrialIssue.id ? { ...e, ...trialIssueForm } : e
                          )
                        }))
                        setEditingTrialIssue(null)
                      } else {
                        addTrialIssue()
                      }
                      setTrialIssueModal(false)
                      setTrialIssueForm({
                        removable: '可拆',
                        category: '生产',
                        phenomenon: '',
                        cause: '',
                        solution: '',
                        owner: '',
                        priority: '中',
                        closeTime: '',
                        status: '待处理'
                      })
                    }}
                    className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    {editingTrialIssue ? '保存' : '添加'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : showFileLibrary ? (
        /* 文件资料页面 - Checklist表格 */
        <main className="max-w-[95vw] mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileLibrary(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                返回物料追踪
              </button>
              <h2 className="text-base font-semibold text-slate-800">文件资料 Checklist</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newId = `fcl_new_${Date.now()}`
                  setFileChecklist((prev) => [...prev, { id: newId, checklist: '', person: '', dueDate: '', status: 'open', docPath: '', docFile: null, comment: '' }])
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                添加行
              </button>
              <button
                onClick={exportFileChecklistExcel}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                导出 Excel
              </button>
              <button
                onClick={() => { handleSave(); setFileLibrarySaveHint(true); setTimeout(() => setFileLibrarySaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
          {fileLibrarySaveHint && (
            <p className="text-sm text-emerald-600 mb-3">已保存，数据已更新</p>
          )}

          {/* Checklist表格 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="text-center py-2.5 px-2 font-medium text-xs w-10">No.</th>
                  <th className="text-left py-2.5 px-3 font-medium text-xs min-w-[280px]">Checklist</th>
                  <th className="text-left py-2.5 px-3 font-medium text-xs min-w-[120px]">负责人</th>
                  <th className="text-left py-2.5 px-3 font-medium text-xs min-w-[130px]">要求完成时间</th>
                  <th className="text-center py-2.5 px-2 font-medium text-xs w-20">Status</th>
                  <th className="text-center py-2.5 px-2 font-medium text-xs min-w-[120px]">Doc. link</th>
                  <th className="text-left py-2.5 px-3 font-medium text-xs min-w-[200px]">Comment</th>
                  <th className="text-center py-2.5 px-2 font-medium text-xs w-12">操作</th>
                </tr>
              </thead>
              <tbody>
                {fileChecklist.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 py-8">暂无数据，点击"添加行"新增</td>
                  </tr>
                ) : (
                  fileChecklist.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="text-center py-1.5 px-2 text-slate-500 text-xs">{index + 1}</td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.checklist}
                          onChange={(e) => setFileChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, checklist: e.target.value } : i))}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="输入Checklist项"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={item.person}
                            onChange={(e) => setFileChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, person: e.target.value } : i))}
                            className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={getDeptHint(item.checklist) || "业务 | IE | PM | 采购 | CMF | ME | Compliance | SQE | TE | Package"}
                            title={getDeptHint(item.checklist) ? `建议部门: ${getDeptHint(item.checklist)}` : "业务 | IE | PM | 采购 | CMF | ME | Compliance | SQE | TE | Package"}
                          />
                          {item.person && internalMembers.some(m => m.name?.trim() === item.person) && (
                            <span className="shrink-0 text-slate-400" title="已关联内部成员">
                              <Users className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => setFileChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, dueDate: e.target.value } : i))}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <select
                          value={item.status}
                          onChange={(e) => setFileChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, status: e.target.value } : i))}
                          className={`rounded border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${item.status === 'close' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}
                        >
                          <option value="open">open</option>
                          <option value="close">close</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="flex flex-col gap-1">
                          {/* 文件路径输入 */}
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={item.docPath || ''}
                              onChange={(e) => updateDocPath(item.id, e.target.value)}
                              placeholder="文件路径 (如 \\server\share\file.pdf)"
                              className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              title="输入本地文件路径或网络路径"
                            />
                            <button
                              onClick={() => handleDocLinkSelect(item.id)}
                              className="shrink-0 rounded border border-dashed border-slate-300 p-1 text-slate-400 hover:text-blue-600 hover:border-blue-400"
                              title="浏览选择文件"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                          </div>
                          {/* 已设置的文件链接 */}
                          {(item.docPath || item.docFile) && (
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-xs text-slate-600 truncate max-w-[150px]" title={item.docPath || item.docFile?.name}>
                                {item.docPath || item.docFile?.name}
                              </span>
                              {item.docFile && (
                                <>
                                  <button
                                    onClick={() => downloadDocFile(item)}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                                    title="下载文件"
                                  >
                                    下载
                                  </button>
                                  <span className="text-[10px] text-green-600 whitespace-nowrap">[已上传]</span>
                                </>
                              )}
                              <button
                                onClick={() => removeDocLink(item.id)}
                                className="p-0.5 rounded text-slate-400 hover:text-red-600"
                                title="移除"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.comment}
                          onChange={(e) => setFileChecklist((prev) => prev.map((i) => i.id === item.id ? { ...i, comment: e.target.value } : i))}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="备注..."
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('确定删除该行？')) {
                              setFileChecklist((prev) => prev.filter((i) => i.id !== item.id))
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              共 {fileChecklist.length} 项 · open: {fileChecklist.filter(i => i.status === 'open').length} · close: {fileChecklist.filter(i => i.status === 'close').length}
            </div>
          </div>

        </main>
      ) : (
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* 全局概览卡片 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">关键物料项数</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">试产时间</p>
                <p className="text-2xl font-bold text-slate-900">{trialProductionTime[filterPhase] || '-'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">风险物料数</p>
                <p className="text-2xl font-bold text-slate-900">{stats.riskCount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 筛选 + 阶段切换 + 添加按钮 */}
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">筛选</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="全部">使用版本：全部</option>
              {VERSIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <span className="text-slate-400">|</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-600">阶段：</span>
            {PHASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setFilterPhase(p); setProductDemandPhase(p) }}
                className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  filterPhase === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="text-slate-400">|</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">试产时间：</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-blue-600 w-8">{filterPhase}</span>
              <span className="rounded-lg border border-transparent px-3 py-2 text-sm text-slate-800 bg-slate-50" title="从里程碑计划 (Actual plan) 自动获取">
                {trialProductionTime[filterPhase] || '-'}
              </span>
            </div>
            {(() => {
              const date = trialProductionTime[filterPhase]
              if (!date) return null
              const days = diffDaysFromToday(date)
              if (days === null) return null
              let colorClass = 'text-slate-400'
              let text = ''
              if (days > 0) { colorClass = 'text-emerald-600'; text = `距离试产还有 ${days} 天` }
              else if (days === 0) { colorClass = 'text-amber-600'; text = '今天是试产日' }
              else { colorClass = 'text-red-500'; text = `试产已过 ${Math.abs(days)} 天` }
              return <span className={`text-sm font-medium whitespace-nowrap ${colorClass}`}>{text}</span>
            })()}
            <button
              type="button"
              onClick={() => setPhaseStartRangesExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              title={phaseStartRangesExpanded ? '收起阶段时间' : '展开阶段时间'}
            >
              {phaseStartRangesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {phaseStartRangesExpanded ? '收起阶段时间' : '展开阶段时间'}
            </button>
          </div>
          {phaseStartRangesExpanded && (
          <div className="flex flex-wrap items-center gap-4 w-full mt-2">
            <span className="text-sm font-medium text-slate-600">阶段试产开始时间（时间区间）：</span>
            <div className="flex flex-wrap gap-6">
              {['可拆', '不可拆'].map((type) => (
                <div key={type} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2 min-w-[280px]">
                  <div className="text-xs font-semibold text-slate-600 border-b border-slate-200 pb-1">{type}</div>
                  {PHASE_START_RANGE_LABELS.map((label, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="w-32 text-slate-700 shrink-0">{label}</span>
                      <input
                        type="date"
                        value={phaseStartRanges[type][index]?.start ?? ''}
                        onChange={(e) => updatePhaseStartRange(type, index, 'start', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="开始日期"
                      />
                      <span className="text-slate-400">～</span>
                      <input
                        type="date"
                        value={phaseStartRanges[type][index]?.end ?? ''}
                        onChange={(e) => updatePhaseStartRange(type, index, 'end', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="结束日期"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          )}
          <button
            onClick={() => { setNewItem((prev) => ({ ...prev, phase: filterPhase })); setModalOpen(true) }}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            添加新物料
          </button>
        </section>

        {/* 物料追踪主表格 */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              当前阶段：<span className="font-semibold text-slate-900">{filterPhase}</span>
              {displayedKeyMaterialKeys.length > 0 && (
                <span className="ml-2 text-slate-400">共 {displayedKeyMaterialKeys.length} 项</span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="text-center py-2.5 px-1 font-medium w-8 text-xs">完成</th>
                  <th className="text-left py-2.5 px-3 font-medium text-xs">物料名称</th>
                  <th className="text-left py-2.5 px-3 font-medium text-xs">供应商</th>
                  <th className="text-left py-2.5 px-2 font-medium text-xs">需求数量</th>
                  <th className="text-left py-2.5 px-2 font-medium text-xs">备料周期(天)</th>
                  <th className="text-left py-2.5 px-2 font-medium text-xs">放行日期</th>
                  <th className="text-left py-2.5 px-2 font-medium text-xs">开始交料</th>
                  <th className="text-left py-2.5 px-2 font-medium text-xs">齐料时间</th>
                  <th className="text-left py-2.5 px-2 font-medium w-20 text-xs">备注</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterialsForDisplay.map(({ key, row, isPlaceholder }, index) => {
                  const confirmDays = diffDaysFromToday(row.demandConfirmDate)
                  const confirmWarn = confirmDays == null ? null : (confirmDays < 3 ? 'red' : confirmDays <= 5 ? 'yellow' : null)
                  const risk = row.id ? isAtRisk(row) : false
                  const etaRowBg = row.id ? getEtaRowBg(row) : ''
                  const handleQty = (field, value) => {
                    if (isPlaceholder) ensureAndUpdateMaterial(key, filterPhase, field, value)
                    else updateQty(row.id, field, value)
                  }
                  const handleField = (field, value) => {
                    if (field === 'name' || field === 'supplier' || field === 'version') {
                      updateMaterialByKey(key, field, value)
                    } else if (isPlaceholder) {
                      ensureAndUpdateMaterial(key, filterPhase, field, value)
                    } else {
                      updateMaterial(row.id, field, value)
                    }
                  }
                  return (
                    <tr
                      key={`${key.name}\0${key.version}\0${filterPhase}`}
                      className={`border-b border-slate-100 ${row.completed ? 'opacity-40 bg-slate-100' : ''} ${!row.completed ? `hover:opacity-95 ${etaRowBg || (risk ? 'bg-amber-50/50' : '')} ${!etaRowBg && !risk ? 'hover:bg-slate-50/50' : ''}` : ''}`}
                    >
                      <td className="py-1.5 px-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!row.completed}
                          onChange={() => {
                            if (isPlaceholder) ensureAndUpdateMaterial(key, filterPhase, 'completed', !row.completed)
                            else updateMaterial(row.id, 'completed', !row.completed)
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title={row.completed ? '取消完成' : '标记完成'}
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleField('name', e.target.value)}
                          className="w-full min-w-[80px] rounded border border-slate-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                          placeholder="物料名称"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.supplier || ''}
                          onChange={(e) => handleField('supplier', e.target.value)}
                          className="w-full min-w-[60px] rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="供应商"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min={0}
                          value={row.requiredQty ?? ''}
                          onChange={(e) => handleQty('requiredQty', e.target.value)}
                          className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min={0}
                          value={row.leadTimeDays ?? ''}
                          onChange={(e) => {
                            const leadTime = parseInt(e.target.value) || 0
                            const eta = row.eta
                            
                            // 输入备料周期，自动计算放行日期（不变动交料日期）
                            let newRelease = row.releaseDate
                            if (eta && leadTime >= 0) {
                              const etaDate = new Date(eta)
                              const release = new Date(etaDate.getTime() - leadTime * 86400000)
                              newRelease = release.toISOString().split('T')[0]
                            }
                            
                            if (isPlaceholder) {
                              ensureAndUpdateMaterial(key, filterPhase, 'leadTimeDays', leadTime)
                              if (newRelease) ensureAndUpdateMaterial(key, filterPhase, 'releaseDate', newRelease)
                            } else {
                              updateMaterial(row.id, 'leadTimeDays', leadTime)
                              if (newRelease) updateMaterial(row.id, 'releaseDate', newRelease)
                            }
                          }}
                          className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="输入备料周期自动计算放行日期"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="date"
                          value={row.releaseDate ?? ''}
                          onChange={(e) => {
                            const releaseDate = e.target.value
                            const eta = row.eta
                            
                            // 输入放行日期，自动计算备料周期（不变动交料日期）
                            let newLeadTime = row.leadTimeDays
                            if (releaseDate && eta) {
                              const release = new Date(releaseDate)
                              const etaDate = new Date(eta)
                              newLeadTime = Math.round((etaDate - release) / 86400000)
                            }
                            
                            if (isPlaceholder) {
                              ensureAndUpdateMaterial(key, filterPhase, 'releaseDate', releaseDate)
                              if (newLeadTime !== undefined) ensureAndUpdateMaterial(key, filterPhase, 'leadTimeDays', newLeadTime)
                            } else {
                              updateMaterial(row.id, 'releaseDate', releaseDate)
                              if (newLeadTime !== undefined) updateMaterial(row.id, 'leadTimeDays', newLeadTime)
                            }
                          }}
                          className="w-28 rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="输入放行日期自动计算备料周期"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="date"
                          value={row.eta ?? ''}
                          onChange={(e) => {
                            const eta = e.target.value
                            const releaseDate = row.releaseDate
                            
                            // 输入开始交料日期，自动计算备料周期（不变动放行日期）
                            let newLeadTime = row.leadTimeDays
                            if (eta && releaseDate) {
                              const etaDate = new Date(eta)
                              const release = new Date(releaseDate)
                              newLeadTime = Math.round((etaDate - release) / 86400000)
                            }
                            // 齐料时间默认等于开始交料日期
                            const newMaterialReady = eta
                            
                            if (isPlaceholder) {
                              ensureAndUpdateMaterial(key, filterPhase, 'eta', eta)
                              if (newLeadTime !== undefined) ensureAndUpdateMaterial(key, filterPhase, 'leadTimeDays', newLeadTime)
                              ensureAndUpdateMaterial(key, filterPhase, 'materialReadyTime', newMaterialReady)
                            } else {
                              updateMaterial(row.id, 'eta', eta)
                              if (newLeadTime !== undefined) updateMaterial(row.id, 'leadTimeDays', newLeadTime)
                              updateMaterial(row.id, 'materialReadyTime', newMaterialReady)
                            }
                          }}
                          className="w-28 rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="输入开始交料日期自动计算备料周期，同时设置齐料时间"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="date"
                          value={row.materialReadyTime ?? ''}
                          onChange={(e) => {
                            if (isPlaceholder) ensureAndUpdateMaterial(key, filterPhase, 'materialReadyTime', e.target.value)
                            else updateMaterial(row.id, 'materialReadyTime', e.target.value)
                          }}
                          className="w-28 rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <button
                          type="button"
                          onClick={() => { setRemarkModalMaterialId(row.id ?? null); setRemarkModalKey(key); setRemarkModalPhase(filterPhase); setRemarkModalValue(row.remark || '') }}
                          className="w-full min-w-[60px] text-left rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 hover:bg-slate-50 text-xs truncate max-w-[100px] block"
                          title="点击查看/编辑完整备注"
                        >
                          {(row.remark || '').trim() || '备注'}
                        </button>
                        <span className="inline-flex items-center gap-0.5 mt-0.5">
                          <button
                            type="button"
                            onClick={() => moveMaterialKey(key, 'up')}
                            disabled={index <= 0}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="上移"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMaterialKey(key, 'down')}
                            disabled={index >= filteredMaterialsForDisplay.length - 1}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="下移"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMaterialByKey(key)}
                            className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {displayedKeyMaterialKeys.length === 0 && (
            <div className="py-12 text-center text-slate-500">暂无关键物料，请先添加（将自动在 EV/DV1/DV2/PV 各建一条，名称与顺序一致）</div>
          )}
        </section>

        {/* 产前准备模块 */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">产前准备</h2>
              <p className="text-sm text-slate-500 mt-0.5">治具/设备/仪器/辅料/资料（Flow Chart/WI/QCP）</p>
            </div>
            <div className="flex items-center gap-2">
              {PHASES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreProductionPhase(p)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    preProductionPhase === p ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600 min-w-[280px]">准备项目</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 w-32">开始时间</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 w-32">完成时间</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 w-24">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 w-28">负责人</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 min-w-[200px]">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {PRE_PRODUCTION_ITEMS.map((item) => {
                    const data = preProductionData[preProductionPhase]?.[item.id] || {}
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-4">
                          <span className="text-slate-800 font-medium">{item.name}</span>
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="date"
                            value={data.startTime || ''}
                            onChange={(e) => {
                              setPreProductionData((prev) => ({
                                ...prev,
                                [preProductionPhase]: {
                                  ...prev[preProductionPhase],
                                  [item.id]: { ...data, startTime: e.target.value }
                                }
                              }))
                            }}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="date"
                            value={data.endTime || ''}
                            onChange={(e) => {
                              setPreProductionData((prev) => ({
                                ...prev,
                                [preProductionPhase]: {
                                  ...prev[preProductionPhase],
                                  [item.id]: { ...data, endTime: e.target.value }
                                }
                              }))
                            }}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <select
                            value={data.status || '未开始'}
                            onChange={(e) => {
                              setPreProductionData((prev) => ({
                                ...prev,
                                [preProductionPhase]: {
                                  ...prev[preProductionPhase],
                                  [item.id]: { ...data, status: e.target.value }
                                }
                              }))
                            }}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="未开始">未开始</option>
                            <option value="进行中">进行中</option>
                            <option value="已完成">已完成</option>
                            <option value="延期">延期</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={data.owner || ''}
                            onChange={(e) => {
                              setPreProductionData((prev) => ({
                                ...prev,
                                [preProductionPhase]: {
                                  ...prev[preProductionPhase],
                                  [item.id]: { ...data, owner: e.target.value }
                                }
                              }))
                            }}
                            placeholder="负责人"
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={data.remark || ''}
                            onChange={(e) => {
                              setPreProductionData((prev) => ({
                                ...prev,
                                [preProductionPhase]: {
                                  ...prev[preProductionPhase],
                                  [item.id]: { ...data, remark: e.target.value }
                                }
                              }))
                            }}
                            placeholder="备注"
                            className="w-full min-w-[200px] rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 样机需求统计 */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">样机需求统计</h2>
              <p className="text-sm text-slate-500 mt-0.5">选择阶段后分别填写耳机、充电盒的样机需求；固定实际需求数量，输入试产良率后自动计算主板投产数量；可填写结构备料数量。</p>
            </div>
            <div className="flex items-center gap-2">
              {PHASES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProductDemandPhase(p)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    productDemandPhase === p ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={exportDemandExcel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                导出 Excel
              </button>
              <button
                type="button"
                onClick={() => addProductColor(productDemandPhase)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                添加颜色
              </button>
            </div>
          </div>
          <div className="p-4 space-y-8">
            {(() => {
              const phase = productDemandPhase
              const colors = productColorsByPhase[phase] || []
              const renderDemandTable = (title, mode, setMode, versionKeys, versionLabels, visibleColumns, setVisibleColumns) => {
                const visibleDefs = ALL_DEMAND_COLUMNS.filter(c => visibleColumns[c.key])
                const colSpanPerVer = visibleDefs.length
                const isOpen = demandColDropdown === title
                return (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                    <div className="flex items-center gap-2">
                      {/* 列显隐控制 */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDemandColDropdown(isOpen ? null : title)}
                          className="rounded px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          列设置 ▾
                        </button>
                        {isOpen && (
                          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                            {ALL_DEMAND_COLUMNS.map((col) => (
                              <label
                                key={col.key}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!visibleColumns[col.key]}
                                  onChange={() => setVisibleColumns((prev) => ({ ...prev, [col.key]: !prev[col.key] }))}
                                  className="rounded border-slate-300"
                                />
                                {col.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">版本：</span>
                      <button
                        type="button"
                        onClick={() => setMode('可拆不可拆')}
                        className={`rounded px-3 py-1.5 text-xs font-medium ${mode === '可拆不可拆' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        可拆 / 不可拆
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('通用')}
                        className={`rounded px-3 py-1.5 text-xs font-medium ${mode === '通用' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        仅通用
                      </button>
                    </div>
                  </div>
                  <div className={mode === '通用' ? 'flex justify-center overflow-x-auto' : 'overflow-x-auto'}>
                    <table className={mode === '通用' ? 'w-max text-sm' : 'w-full text-sm'}>
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-1 px-1.5 text-xs font-medium text-slate-600 w-16 sticky left-0 bg-slate-50 z-10">颜色</th>
                          {versionKeys.map((ver) => (
                            <Fragment key={ver}>
                              <th colSpan={colSpanPerVer} className="py-1 px-1.5 text-xs font-medium text-slate-600 border-l border-slate-200 bg-white text-center">{versionLabels[ver]}</th>
                            </Fragment>
                          ))}
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-1 px-1.5 w-16 sticky left-0 bg-slate-50 z-10 text-[10px]"></th>
                          {versionKeys.map((ver) => (
                            <Fragment key={ver}>
                              {visibleDefs.map((col) => (
                                <th key={col.key} className="py-1 px-1 text-[10px] font-medium text-slate-500 border-l border-slate-100 text-center whitespace-nowrap">{col.label}</th>
                              ))}
                            </Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {colors.map((color) => (
                          <tr key={color} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-1 px-1.5 font-medium text-slate-800 sticky left-0 bg-white text-xs">
                              <span className="inline-flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingColorPhase === phase && editingColorKey === color ? editingColorValue : color}
                                  onChange={(e) => {
                                    if (editingColorPhase !== phase || editingColorKey !== color) {
                                      setEditingColorPhase(phase)
                                      setEditingColorKey(color)
                                      setEditingColorValue(color)
                                    }
                                    setEditingColorValue(e.target.value)
                                  }}
                                  onFocus={() => { setEditingColorPhase(phase); setEditingColorKey(color); setEditingColorValue(color) }}
                                  onBlur={() => {
                                    const v = editingColorValue.trim()
                                    if (v && v !== color) renameProductColor(phase, color, v)
                                    setEditingColorPhase(null)
                                    setEditingColorKey(null)
                                  }}
                                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                                  className="w-14 rounded border border-slate-200 bg-white px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button type="button" onClick={() => removeProductColor(phase, color)} className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title={`删除颜色「${color}」`}><X className="w-3.5 h-3.5" /></button>
                              </span>
                            </td>
                            {versionKeys.map((ver) => {
                              const cell = (productDemands[phase]?.[ver]?.[color]) || { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
                              const putIn = Number(cell.putInQty) || 0
                              const actual = Number(cell.actualDemand) || 0
                              const yieldPct = putIn > 0 && actual > 0 ? Math.min(100, Math.round((actual / putIn) * 100)) : ''
                              return (
                                <Fragment key={ver}>
                                  {visibleDefs.map((col, colIdx) => {
                                    const isFirstInVer = colIdx === 0
                                    if (col.key === 'putInQty') return (
                                      <td key={col.key} className={`py-1.5 px-1.5 ${isFirstInVer ? 'border-l border-slate-100' : ''} text-center`}>
                                        <input type="number" min={0} value={cell.putInQty ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'putInQty', e.target.value)} className="w-14 rounded border border-slate-300 px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" title="可由试产良率反算" />
                                      </td>
                                    )
                                    if (col.key === 'fpcPutInQty') return (
                                      <td key={col.key} className="py-1.5 px-1.5 text-center">
                                        <input type="number" min={0} value={cell.fpcPutInQty ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'fpcPutInQty', e.target.value)} className="w-14 rounded border border-slate-300 px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                      </td>
                                    )
                                    if (col.key === 'structurePutInQty') return (
                                      <td key={col.key} className="py-1.5 px-1.5 text-center">
                                        <input type="number" min={0} value={cell.structurePutInQty ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'structurePutInQty', e.target.value)} className="w-14 rounded border border-slate-300 px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                      </td>
                                    )
                                    if (col.key === 'actualDemand') return (
                                      <td key={col.key} className="py-1.5 px-1.5 text-center">
                                        <input type="number" min={0} value={cell.actualDemand ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'actualDemand', e.target.value)} className="w-14 rounded border border-slate-300 px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                      </td>
                                    )
                                    if (col.key === 'customerSample') return (
                                      <td key={col.key} className="py-1.5 px-1.5 text-center">
                                        <input type="number" min={0} value={cell.customerSample ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'customerSample', e.target.value)} className="w-14 rounded border border-slate-300 px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                      </td>
                                    )
                                    if (col.key === 'yield') return (
                                      <td key={col.key} className="py-1.5 px-1.5 text-center">
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={yieldPct === '' ? '' : yieldPct}
                                          onChange={(e) => updateProductDemandByYield(phase, ver, color, e.target.value)}
                                          className="w-12 rounded border border-slate-300 px-1 py-1 text-center text-xs text-slate-700 tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500"
                                          placeholder="%"
                                          title="输入后按实际需求数量反算主板投产数量"
                                        />
                                        {yieldPct !== '' && <span className="text-slate-500 ml-0.5 text-xs">%</span>}
                                      </td>
                                    )
                                    return null
                                  })}
                                </Fragment>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 border-t-2 border-slate-200 font-medium text-slate-800">
                          <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10">合计</td>
                          {versionKeys.map((ver) => (
                            <Fragment key={ver}>
                              {visibleDefs.map((col, colIdx) => {
                                const isFirstInVer = colIdx === 0
                                if (col.key === 'yield') return <td key={col.key} className={`py-1.5 px-1.5 ${isFirstInVer ? 'border-l border-slate-200' : ''} text-center text-slate-500 tabular-nums`}>—</td>
                                const sum = colors.reduce((s, c) => s + (Number((productDemands[phase]?.[ver]?.[c])?.[col.key]) || 0), 0)
                                return <td key={col.key} className={`py-1.5 px-1.5 ${isFirstInVer ? 'border-l border-slate-200' : ''} text-center tabular-nums`}>{sum || 0}</td>
                              })}
                            </Fragment>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              const earphoneVersions = demandEarphoneMode === '通用' ? ['耳机可拆'] : ['耳机可拆', '耳机不可拆']
              const chargerVersions = demandChargerMode === '通用' ? ['充电盒可拆'] : ['充电盒可拆', '充电盒不可拆']
              const earphoneLabels = demandEarphoneMode === '通用' ? { '耳机可拆': '通用' } : { '耳机可拆': '耳机-可拆', '耳机不可拆': '耳机-不可拆' }
              const chargerLabels = demandChargerMode === '通用' ? { '充电盒可拆': '通用' } : { '充电盒可拆': '充电盒-可拆', '充电盒不可拆': '充电盒-不可拆' }
              return (
                <>
                  {renderDemandTable('耳机', demandEarphoneMode, setDemandEarphoneMode, earphoneVersions, earphoneLabels, earphoneColVis, setEarphoneColVis)}
                  {renderDemandTable('充电盒', demandChargerMode, setDemandChargerMode, chargerVersions, chargerLabels, chargerColVis, setChargerColVis)}
                </>
              )
            })()}
          </div>
        </section>
      </main>
      )}
        </>
      )}

      {/* 添加新物料弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">添加新物料</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">物料名称</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="如：喇叭 (Speaker)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">阶段</label>
                  <select
                    value={newItem.phase || filterPhase}
                    onChange={(e) => setNewItem((p) => ({ ...p, phase: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">使用版本</label>
                  <select
                    value={newItem.version}
                    onChange={(e) => setNewItem((p) => ({ ...p, version: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {VERSIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">供应商</label>
                  <input
                    type="text"
                    value={newItem.supplier || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, supplier: e.target.value }))}
                    placeholder="供应商名称"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">需求数量</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.requiredQty || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, requiredQty: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">单位</label>
                  <select
                    value={newItem.unit || '套'}
                    onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">备料周期（天）</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.leadTimeDays || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, leadTimeDays: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">开始交料日期</label>
                <input
                  type="date"
                  value={newItem.eta}
                  onChange={(e) => setNewItem((p) => ({ ...p, eta: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">齐料时间</label>
                <input
                  type="date"
                  value={newItem.materialReadyTime || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, materialReadyTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">到料时间</label>
                <input
                  type="date"
                  value={newItem.arrivalTime || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, arrivalTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">风险程度</label>
                  <select
                    value={newItem.riskLevel || '无'}
                    onChange={(e) => setNewItem((p) => ({ ...p, riskLevel: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {RISK_LEVELS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">备注</label>
                  <input
                    type="text"
                    value={newItem.remark || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, remark: e.target.value }))}
                    placeholder="选填"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={addMaterial}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 备注完整查看/编辑弹窗 */}
      {remarkModalMaterialId != null || remarkModalKey != null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setRemarkModalMaterialId(null); setRemarkModalKey(null); setRemarkModalPhase(null) }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">备注</h2>
              <button type="button" onClick={() => { setRemarkModalMaterialId(null); setRemarkModalKey(null); setRemarkModalPhase(null) }} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              value={remarkModalValue}
              onChange={(e) => setRemarkModalValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入备注内容..."
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setRemarkModalMaterialId(null); setRemarkModalKey(null); setRemarkModalPhase(null) }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</button>
              <button
                type="button"
                onClick={() => {
                  if (remarkModalMaterialId) updateMaterial(remarkModalMaterialId, 'remark', remarkModalValue)
                  else if (remarkModalKey && remarkModalPhase) ensureAndUpdateMaterial(remarkModalKey, remarkModalPhase, 'remark', remarkModalValue)
                  setRemarkModalMaterialId(null)
                  setRemarkModalKey(null)
                  setRemarkModalPhase(null)
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 项目问题点 Actions or Details 放大预览/编辑弹窗 */}
      {workbookDetailModal != null && (() => {
        const { category, entryId } = workbookDetailModal
        const entry = (workbookEntries[category] || []).find((e) => e.id === entryId)
        if (!entry) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setWorkbookDetailModal(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Actions or Details — {category}</h2>
                <button type="button" onClick={() => setWorkbookDetailModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <textarea
                value={workbookDetailContent}
                onChange={(e) => setWorkbookDetailContent(e.target.value)}
                className="flex-1 min-h-[200px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                placeholder="输入问题描述或跟进措施..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setWorkbookDetailModal(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</button>
                <button
                  type="button"
                  onClick={() => { updateWorkbookEntry(category, entryId, 'content', workbookDetailContent); setWorkbookDetailModal(null) }}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 项目计划 - 备注放大编辑弹窗 */}
      {planCommentModal != null && (() => {
        const m = projectPlanMilestones.find((x) => x.id === planCommentModal)
        if (!m) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPlanCommentModal(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800">备注 — {m.label || '节点'}</h2>
                <button type="button" onClick={() => setPlanCommentModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <textarea
                value={planCommentValue}
                onChange={(e) => setPlanCommentValue(e.target.value)}
                className="flex-1 min-h-[200px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="输入备注描述..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setPlanCommentModal(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</button>
                <button
                  type="button"
                  onClick={() => { updateProjectPlanComment(planCommentModal, planCommentValue); setPlanCommentModal(null) }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 内部版本号编辑弹窗 */}
      {showInternalVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowInternalVersionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">内部版本号</h2>
              <button onClick={() => setShowInternalVersionModal(false)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">版本号</label>
              <input
                type="text"
                value={internalVersionValue}
                onChange={(e) => setInternalVersionValue(e.target.value)}
                placeholder="输入内部版本号"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInternalVersionModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setInternalVersion(internalVersionValue)
                  setShowInternalVersionModal(false)
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

	    </div>
	  )
	}
