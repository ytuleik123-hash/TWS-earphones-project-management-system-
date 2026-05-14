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
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

// ========== 鏂伴」鐩鍒掗〉闈㈢粍浠?==========
function ProjectPlanPage({ projectName, onBack, onSave, planPages: initialPlanPages, ganttPlans: initialGanttPlans, onPlanPagesChange, onGanttPlansChange, initialMilestones, initialColumns, initialCells, initialComments, onMilestonesChange, onColumnsChange, onCellsChange, onCommentsChange }) {
  // 璁″垝椤甸潰鍒楄〃锛氶粯璁ょ涓€涓槸閲岀▼纰戣妭鐐?
  const [planPages, setPlanPages] = useState(initialPlanPages || [
    { id: 'milestone', name: '閲岀▼纰戣妭鐐?, type: 'milestone' }
  ])
  const [activePlanId, setActivePlanId] = useState('milestone')
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [saveHint, setSaveHint] = useState(false)

  // 鐢樼壒鍥捐鍒掍换鍔℃暟鎹?
  const [ganttPlans, setGanttPlans] = useState(initialGanttPlans || {})

  // 閲岀▼纰戣妭鐐规暟鎹?
  const [milestoneData, setMilestoneData] = useState({
    milestones: initialMilestones || [
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
    ],
    columns: initialColumns || [
      { id: 'pc_0', name: 'Original Plan' },
      { id: 'pc_1', name: 'Actual plan' }
    ],
    cells: initialCells || {},
    comments: initialComments || {}
  })


  const activePlan = planPages.find(p => p.id === activePlanId)

  // 娣诲姞鏂扮殑璁″垝椤甸潰
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
    // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
    if (onPlanPagesChange) onPlanPagesChange(newPlanPages)
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 鑷姩淇濆瓨鍒扮埗缁勪欢锛堥潤榛樻ā寮忥級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 鍒犻櫎璁″垝椤甸潰
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
    // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
    if (onPlanPagesChange) onPlanPagesChange(newPlanPages)
    if (onGanttPlansChange) onGanttPlansChange(newPlans)
    // 鑷姩淇濆瓨锛堥潤榛樻ā寮忥級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 鑾峰彇鎴栧垱寤虹敇鐗瑰浘浠诲姟
  const getGanttTasks = (planId) => {
    return ganttPlans[planId] || []
  }

  // 鏇存柊鐢樼壒鍥句换鍔?
  const updateGanttTask = (planId, taskId, field, value) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx >= 0) {
      const task = { ...tasks[idx], [field]: value }
      
      // 鏅鸿兘璁＄畻鏃堕棿
      if (field === 'duration') {
        // 鍛ㄦ湡鏀瑰彉锛岄噸鏂拌绠楀畬鎴愭椂闂?
        const duration = parseInt(value) || 0
        if (duration > 0 && task.start) {
          const start = new Date(task.start)
          const end = new Date(start.getTime() + duration * 86400000)
          task.end = end.toISOString().split('T')[0]
        }
      } else if (field === 'end') {
        // 瀹屾垚鏃堕棿鏀瑰彉锛岄噸鏂拌绠楀懆鏈?
        if (task.start && value) {
          const start = new Date(task.start)
          const end = new Date(value)
          task.duration = Math.max(1, Math.ceil((end - start) / 86400000))
        }
      } else if (field === 'start') {
        // 寮€濮嬫椂闂存敼鍙橈紝鏍规嵁鍛ㄦ湡閲嶆柊璁＄畻瀹屾垚鏃堕棿
        if (value && task.duration) {
          const start = new Date(value)
          const end = new Date(start.getTime() + task.duration * 86400000)
          task.end = end.toISOString().split('T')[0]
        }
      }
      
      tasks[idx] = task
      newGanttPlans[planId] = tasks
      setGanttPlans(newGanttPlans)
      // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    }
    // 鑷姩淇濆瓨锛堥潤榛樻ā寮忥紝涓嶆樉绀哄脊绐楋級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 娣诲姞浠诲姟
  const addGanttTask = (planId, parentId = null) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 86400000)
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '鏂颁换鍔?,
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
    // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 鑷姩淇濆瓨锛堥潤榛樻ā寮忥級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 娣诲姞瀛愪换鍔?
  const addSubTask = (planId, parentId) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
    const parent = tasks.find(t => t.id === parentId)
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '鏂板瓙浠诲姟',
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
    // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 鑷姩淇濆瓨锛堥潤榛樻ā寮忥級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 鍒囨崲浠诲姟灞曞紑/鎶樺彔
  const toggleTaskExpanded = (planId, taskId) => {
    const newGanttPlans = { ...ganttPlans }
    const tasks = [...(newGanttPlans[planId] || [])]
    const idx = tasks.findIndex(t => t.id === taskId)
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], expanded: !tasks[idx].expanded }
      newGanttPlans[planId] = tasks
      setGanttPlans(newGanttPlans)
      // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    }
    // 鑷姩淇濆瓨锛堥潤榛樻ā寮忥級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 瑙ｆ瀽渚濊禆瀛楃涓?(濡?"FS-2", "SS+3", "3", "FS")
  const parseDependency = (depStr) => {
    if (!depStr) return null
    depStr = depStr.trim().toUpperCase()
    
    // 鍖归厤妯″紡: FS-2, SS+3, FF-1, SF+5, 鎴栧彧鏈夋暟瀛?
    const match = depStr.match(/^(FS|SS|FF|SF)?([+-]?\d+)?$/)
    if (!match) return null
    
    const type = match[1] || 'FS' // 榛樿FS
    const lag = parseInt(match[2] || '0')
    
    return { type, lag }
  }

  // 鏍煎紡鍖栦緷璧栨樉绀?
  const formatDependency = (dep) => {
    if (!dep) return ''
    if (dep.lag === 0) return dep.type
    if (dep.lag > 0) return `${dep.type}+${dep.lag}`
    return `${dep.type}${dep.lag}`
  }

  // 鏍规嵁渚濊禆鍏崇郴璁＄畻浠诲姟鏃堕棿
  const calculateTaskFromDependency = (task, predecessor, depStr) => {
    const dep = parseDependency(depStr)
    if (!dep || !predecessor || !predecessor.start || !predecessor.end) return null
    
    const predStart = new Date(predecessor.start)
    const predEnd = new Date(predecessor.end)
    let newStart, newEnd
    
    switch (dep.type) {
      case 'FS': // 瀹屾垚-寮€濮? 鍓嶇疆浠诲姟瀹屾垚鍚庡紑濮?
        newStart = new Date(predEnd.getTime() + dep.lag * 86400000)
        newEnd = new Date(newStart.getTime() + task.duration * 86400000)
        break
      case 'SS': // 寮€濮?寮€濮? 鍓嶇疆浠诲姟寮€濮嬪悗寮€濮?
        newStart = new Date(predStart.getTime() + dep.lag * 86400000)
        newEnd = new Date(newStart.getTime() + task.duration * 86400000)
        break
      case 'FF': // 瀹屾垚-瀹屾垚: 鍓嶇疆浠诲姟瀹屾垚鍚庡畬鎴?
        newEnd = new Date(predEnd.getTime() + dep.lag * 86400000)
        newStart = new Date(newEnd.getTime() - task.duration * 86400000)
        break
      case 'SF': // 寮€濮?瀹屾垚: 鍓嶇疆浠诲姟寮€濮嬪悗瀹屾垚
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

  // 鏇存柊浠诲姟渚濊禆
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
        
        // 鏍规嵁渚濊禆閲嶆柊璁＄畻鏃堕棿
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
      // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
      if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    }
    // 鑷姩淇濆瓨锛堥潤榛樻ā寮忥級
    setTimeout(() => {
      if (onSave) onSave({ silent: true })
    }, 0)
  }

  // 鍒犻櫎浠诲姟锛堝悓鏃跺垹闄ゅ瓙浠诲姟锛?
  const deleteGanttTask = (planId, taskId) => {
    const newGanttPlans = {
      ...ganttPlans,
      [planId]: (ganttPlans[planId] || []).filter(t => t.id !== taskId && t.parentId !== taskId)
    }
    setGanttPlans(newGanttPlans)
    // 閫氱煡鐖剁粍浠剁姸鎬佸彉鍖?
    if (onGanttPlansChange) onGanttPlansChange(newGanttPlans)
    // 鑷姩淇濆瓨
    setTimeout(() => {
      onSave()
    }, 0)
  }

  // 璁＄畻鐢樼壒鍥炬椂闂磋寖鍥达紙澧炲姞鍓嶅悗padding锛?
  const getGanttRange = (tasks) => {
    if (!tasks || tasks.length === 0) return null
    const dates = tasks.filter(t => t.start).map(t => new Date(t.start))
    if (dates.length === 0) return null
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...tasks.filter(t => t.end).map(t => new Date(t.end))))
    
    // 鎵╁睍鑼冨洿锛屽墠鍚庡悇鍔犲嚑澶?
    const paddingDays = 7
    minDate.setDate(minDate.getDate() - paddingDays)
    maxDate.setDate(maxDate.getDate() + paddingDays)
    
    return { start: minDate, end: maxDate }
  }

  // 鐢熸垚鏃堕棿杞村埢搴?
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

  // 鐢樼壒鍥炬潯褰綅缃绠?
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

  // 渚濊禆鍏崇郴缂栬緫鍣ㄧ粍浠?
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
      if (!dep) return <span className="text-slate-400 text-xs cursor-pointer" onClick={() => setIsEditing(true)}>鐐瑰嚮璁剧疆</span>
      const depTask = tasks.find(t => t.id === dep.taskId)
      const lagStr = dep.lag > 0 ? `+${dep.lag}` : dep.lag < 0 ? dep.lag : ''
      return (
        <div className="cursor-pointer text-xs" onClick={() => setIsEditing(true)}>
          <span className="text-blue-600 font-medium">{depTask?.name || '鏈煡'}</span>
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
          <option value="">鏃犲墠缃?/option>
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
              placeholder="鍋忕Щ"
            />
          </div>
        )}
        <div className="flex gap-1">
          <button onClick={handleSave} className="flex-1 bg-blue-500 text-white text-[10px] py-0.5 rounded">纭畾</button>
          <button onClick={handleClear} className="flex-1 bg-slate-300 text-slate-700 text-[10px] py-0.5 rounded">娓呴櫎</button>
        </div>
      </div>
    )
  }

  // 閲岀▼纰戣妭鐐归〉闈紙鍘熸湁鍔熻兘锛?
  const MilestonePage = ({ initialMilestones, initialColumns, initialCells, initialComments, onMilestonesChange, onColumnsChange, onCellsChange, onCommentsChange }) => {
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
      const newMilestones = [...milestones, { id: `pm_${Date.now()}`, label: '鏂拌妭鐐? }]
      setMilestones(newMilestones)
      if (onMilestonesChange) onMilestonesChange(newMilestones)
    }
    const addColumn = () => {
      const newColumns = [...columns, { id: `pc_${Date.now()}`, name: '鏂板垪' }]
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
            <Plus className="w-4 h-4" /> 鏂板琛?
          </button>
          <button onClick={addColumn} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
            <Plus className="w-4 h-4" /> 鏂板鍒?
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
                          defaultValue={col.name}
                          onBlur={(e) => updateColumn(col.id, e.target.value)}
                          onKeyDown={(e) => {
                            // 闃叉閫€鏍奸敭瑙﹀彂娴忚鍣ㄨ繑鍥?
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                            // 鎸?Enter 淇濆瓨
                            if (e.key === 'Enter') {
                              e.target.blur()
                            }
                          }}
                          className="flex-1 min-w-0 bg-transparent text-white font-medium border-b border-slate-400 focus:outline-none focus:border-white px-1 py-0.5 text-xs"
                          placeholder="鍒楀悕"
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
                          defaultValue={m.label}
                          onBlur={(e) => updateMilestone(m.id, e.target.value)}
                          onKeyDown={(e) => {
                            // 闃叉閫€鏍奸敭瑙﹀彂娴忚鍣ㄨ繑鍥?
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                            // 鎸?Enter 淇濆瓨
                            if (e.key === 'Enter') {
                              e.target.blur()
                            }
                          }}
                          className="flex-1 min-w-0 rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="鑺傜偣鍚嶇О"
                        />
                        <button onClick={() => deleteMilestone(m.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td key={col.id} className="py-1.5 px-2 border border-slate-200 align-top">
                        <input
                          type="text"
                          defaultValue={cells[`${m.id}_${col.id}`] || ''}
                          onBlur={(e) => updateCell(m.id, col.id, e.target.value)}
                          onKeyDown={(e) => {
                            // 闃叉閫€鏍奸敭瑙﹀彂娴忚鍣ㄨ繑鍥?
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                            // 鎸?Enter 淇濆瓨
                            if (e.key === 'Enter') {
                              e.target.blur()
                            }
                          }}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="鏃ユ湡濡?2025/1/8"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-2 border border-slate-200 align-top">
                      <div
                        onClick={() => { setCommentModal(m.id); setCommentValue(comments[m.id] || '') }}
                        className="flex items-start gap-1 min-h-[44px] rounded border border-slate-300 px-2 py-1.5 text-slate-800 text-xs text-left cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 w-full"
                      >
                        <span className="flex-1 min-w-0 line-clamp-3">
                          {(comments[m.id] || '').trim() || <span className="text-slate-400">鐐瑰嚮鏀惧ぇ鏌ョ湅/缂栬緫澶囨敞</span>}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // 瀵煎嚭鐢樼壒鍥惧埌Excel
  const exportGanttToExcel = (planId) => {
    const tasks = getGanttTasks(planId)
    if (tasks.length === 0) {
      alert('娌℃湁鍙鍑虹殑浠诲姟')
      return
    }

    const data = tasks.map(task => ({
      '浠诲姟鍚嶇О': task.name,
      '寮€濮嬫椂闂?: task.start,
      '瀹屾垚鏃堕棿': task.end,
      '鍛ㄦ湡(澶?': task.duration,
      '璐熻矗鏂?: task.assignee || '',
      '杩涘害(%)': task.progress || 0,
      '鐖朵换鍔D': task.parentId || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '椤圭洰璁″垝')
    XLSX.writeFile(wb, `${projectName || '椤圭洰'}_璁″垝_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // 瀵煎叆鐢樼壒鍥句粠Excel
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
          name: row['浠诲姟鍚嶇О'] || '鏈懡鍚嶄换鍔?,
          start: row['寮€濮嬫椂闂?] || new Date().toISOString().split('T')[0],
          end: row['瀹屾垚鏃堕棿'] || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          duration: parseInt(row['鍛ㄦ湡(澶?']) || 1,
          assignee: row['璐熻矗鏂?] || '',
          progress: parseInt(row['杩涘害(%)']) || 0,
          parentId: row['鐖朵换鍔D'] || null,
          expanded: true,
          dependencies: [],
        }))

        setGanttPlans(prev => ({ ...prev, [planId]: importedTasks }))
        alert(`鎴愬姛瀵煎叆 ${importedTasks.length} 涓换鍔)
      } catch (err) {
        alert('瀵煎叆澶辫触锛? + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // 鐢樼壒鍥鹃〉闈?
  const GanttPage = ({ planId }) => {
    const tasks = getGanttTasks(planId)
    const range = getGanttRange(tasks)
    const timeScale = generateTimeScale(range)
    const fileInputRef = useRef(null)
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button 
            onClick={() => addGanttTask(planId)} 
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" /> 鏂板浠诲姟
          </button>
          <button 
            onClick={() => exportGanttToExcel(planId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" /> 瀵煎嚭Excel
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" /> 瀵煎叆Excel
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
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[40px] sticky left-0 bg-slate-700 z-20">灞曞紑</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[180px] sticky left-[40px] bg-slate-700 z-20">浠诲姟鍚嶇О</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[100px]">寮€濮嬫椂闂?/th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[100px]">瀹屾垚鏃堕棿</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[65px]">鍛ㄦ湡</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[90px]">璐熻矗鏂?/th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[120px]">鍓嶇疆鑺傜偣</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[70px]">鎿嶄綔</th>
                  <th className="text-left py-2 px-2 font-medium border border-slate-600 min-w-[500px]">
                    <div className="flex items-center justify-between">
                      <span>鐢樼壒鍥?/span>
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
                        <input
                          type="text"
                          defaultValue={task.name}
                          onBlur={(e) => updateGanttTask(planId, task.id, 'name', e.target.value)}
                          onKeyDown={(e) => {
                            // 闃叉閫€鏍奸敭瑙﹀彂娴忚鍣ㄨ繑鍥?
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                            // 鎸?Enter 淇濆瓨
                            if (e.key === 'Enter') {
                              e.target.blur()
                            }
                          }}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="浠诲姟鍚嶇О"
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
                          placeholder="澶╂暟"
                        />
                      </td>
                      <td className="py-1.5 px-2 border border-slate-200">
                        <input
                          type="text"
                          defaultValue={task.assignee || ''}
                          onBlur={(e) => updateGanttTask(planId, task.id, 'assignee', e.target.value)}
                          onKeyDown={(e) => {
                            // 闃叉閫€鏍奸敭瑙﹀彂娴忚鍣ㄨ繑鍥?
                            if (e.key === 'Backspace' && e.target.value.length === 0) {
                              e.preventDefault()
                            }
                            // 鎸?Enter 淇濆瓨
                            if (e.key === 'Enter') {
                              e.target.blur()
                            }
                          }}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="璐熻矗鏂?
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
                            onClick={() => addSubTask(planId, task.id)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="娣诲姞瀛愪换鍔?
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
                          {/* 鏃堕棿鍒诲害鑳屾櫙 */}
                          {timeScale.map((tick, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 border-l border-slate-200"
                              style={{ left: `${tick.position}%` }}
                            />
                          ))}
                          {/* 浠诲姟鏉?*/}
                          {range && task.start && (
                            <div
                              className="absolute top-1.5 h-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded shadow-sm flex items-center justify-center text-white text-[10px] font-medium"
                              style={getBarStyle(task, range)}
                              title={`${task.name}: ${task.start} 鑷?${task.end} (${task.duration}澶?`}
                            >
                              {task.duration >= 3 ? `${task.duration}澶ー : ''}
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
            <div className="py-12 text-center text-slate-500">鏆傛棤浠诲姟锛岀偣鍑汇€屾柊澧炰换鍔°€嶆坊鍔?/div>
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
            杩斿洖鐗╂枡杩借釜
          </button>
          <h2 className="text-base font-semibold text-slate-800">{projectName || '鏈懡鍚嶉」鐩?} 路 椤圭洰璁″垝</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { onSave(); setSaveHint(true); setTimeout(() => setSaveHint(false), 2000) }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
          >
            <Save className="w-4 h-4" />
            淇濆瓨
          </button>
        </div>
      </div>
      
      {saveHint && (
        <p className="text-sm text-emerald-600 mb-4">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
      )}

      {/* 璁″垝椤甸潰鍒囨崲鏍囩 */}
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
            <button
              onClick={() => setActivePlanId(plan.id)}
              className="flex-1"
            >
              {plan.name}
            </button>
            {plan.id !== 'milestone' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`纭畾瑕佸垹闄よ鍒掗〉闈?${plan.name}"鍚楋紵姝ゆ搷浣滀笉鍙仮澶嶃€俙)) {
                    deletePlanPage(plan.id)
                  }
                }}
                className="ml-1 p-0.5 rounded hover:bg-white/20 text-current opacity-70 hover:opacity-100"
                title="鍒犻櫎姝よ鍒掗〉闈?
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          title="鏂板缓璁″垝椤甸潰"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 鏍规嵁褰撳墠閫変腑椤甸潰鏄剧ず涓嶅悓鍐呭 */}
      {activePlanId === 'milestone' ? (
        <MilestonePage 
          initialMilestones={milestoneData.milestones}
          initialColumns={milestoneData.columns}
          initialCells={milestoneData.cells}
          initialComments={milestoneData.comments}
          onMilestonesChange={(milestones) => {
            setMilestoneData(prev => ({ ...prev, milestones }))
            if (onMilestonesChange) onMilestonesChange(milestones)
          }}
          onColumnsChange={(columns) => {
            setMilestoneData(prev => ({ ...prev, columns }))
            if (onColumnsChange) onColumnsChange(columns)
          }}
          onCellsChange={(cells) => {
            setMilestoneData(prev => ({ ...prev, cells }))
            if (onCellsChange) onCellsChange(cells)
          }}
          onCommentsChange={(comments) => {
            setMilestoneData(prev => ({ ...prev, comments }))
            if (onCommentsChange) onCommentsChange(comments)
          }}
        />
      ) : (
        <GanttPage planId={activePlanId} />
      )}

      {/* 鏂板缓璁″垝椤甸潰妯℃€佹 */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">鏂板缓璁″垝椤甸潰</h3>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="杈撳叆璁″垝椤甸潰鍚嶇О"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowNewPlanModal(false); setNewPlanName('') }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                鍙栨秷
              </button>
              <button
                onClick={addNewPlan}
                disabled={!newPlanName.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                鍒涘缓
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

const VERSIONS = ['閫氱敤', 'Replaceable', 'Non-replaceable']
const UNITS = ['濂?, 'pcs']
const RISK_LEVELS = ['鏃?, '浣?, '涓?, '楂?]
const PHASES = ['EV', 'DV1', 'DV2', 'PV']
const DISTRIBUTION_STAGES = ['EV', 'DV1', 'DV2', 'PV'] // 鏍锋満鍒嗗彂鐧昏娓呭崟闃舵
const PRODUCT_VERSIONS = ['Replaceable', 'Non-replaceable']
// 鏍锋満闇€姹傝〃鏍艰锛堝惈瀹㈡埛瀹為檯闇€姹傚垎 Replaceable/Non-replaceable锛夛紝椤哄簭鍙皟
const DEFAULT_TABLE_ROW_ORDER = ['Replaceable', 'Non-replaceable', '瀹㈡埛瀹為檯闇€姹?Replaceable', '瀹㈡埛瀹為檯闇€姹?Non-replaceable']
const STATUS_LABELS = {
  none: '鏈氦璐?,
  partial: '閮ㄥ垎浜よ揣',
  full: '宸查綈濂?,
}

// ---------- 鍒濆 Mock 鏁版嵁锛堥浂浠朵笉鍖哄垎棰滆壊锛岄鑹蹭负浜у搧鏁存満棰滆壊锛涗娇鐢ㄧ増鏈粯璁ら€氱敤锛?--------
function getInitialMaterials() {
  const now = new Date()
  const fmt = (d) => d.toISOString().slice(0, 10)
  const addDays = (days) => new Date(now.getTime() + days * 86400000)

  return [
    { id: '1', name: '鍠囧彮', version: '閫氱敤', phase: 'DV1', supplier: '鐟炲０绉戞妧', unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: '', requiredQty: 500, leadTimeDays: 20, demandConfirmDate: fmt(addDays(-15)), eta: fmt(addDays(5)), releaseDate: fmt(addDays(-15)), materialReadyTime: '' },
    { id: '2', name: '鍠囧彮', version: '閫氱敤', phase: 'DV1', supplier: '鐟炲０绉戞妧', unit: '濂?, riskLevel: '浣?, remark: '', arrivalTime: fmt(addDays(3)), requiredQty: 500, leadTimeDays: 15, demandConfirmDate: fmt(addDays(-5)), eta: fmt(addDays(10)), releaseDate: fmt(addDays(-5)), materialReadyTime: '' },
    { id: '3', name: '鍠囧彮', version: '閫氱敤', phase: 'DV2', supplier: '鐟炲０绉戞妧', unit: '濂?, riskLevel: '涓?, remark: '', arrivalTime: '', requiredQty: 300, leadTimeDays: 25, demandConfirmDate: fmt(addDays(-5)), eta: fmt(addDays(20)), releaseDate: fmt(addDays(-5)), materialReadyTime: '' },
    { id: '4', name: '鍠囧彮', version: '閫氱敤', phase: 'DV2', supplier: '鐟炲０绉戞妧', unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: fmt(addDays(12)), requiredQty: 300, leadTimeDays: 10, demandConfirmDate: fmt(addDays(5)), eta: fmt(addDays(15)), releaseDate: fmt(addDays(5)), materialReadyTime: '' },
    { id: '5', name: '鑰虫満涓绘澘 (Buds PCBA)', version: 'Replaceable', phase: 'DV1', supplier: '绔嬭绮惧瘑', unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: fmt(addDays(-2)), requiredQty: 800, leadTimeDays: 30, demandConfirmDate: fmt(addDays(-32)), eta: fmt(addDays(-2)), releaseDate: fmt(addDays(-32)), materialReadyTime: '' },
    { id: '6', name: '鑰虫満涓绘澘 (Buds PCBA)', version: 'Non-replaceable', phase: 'DV1', supplier: '绔嬭绮惧瘑', unit: '濂?, riskLevel: '浣?, remark: '', arrivalTime: '', requiredQty: 600, leadTimeDays: 20, demandConfirmDate: fmt(addDays(-13)), eta: fmt(addDays(7)), releaseDate: fmt(addDays(-13)), materialReadyTime: '' },
    { id: '7', name: '鍏呯數鐩掍富鏉?(Case PCBA)', version: '閫氱敤', phase: 'DV1', supplier: '姣斾簹杩數瀛?, unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: fmt(addDays(0)), requiredQty: 1000, leadTimeDays: 10, demandConfirmDate: fmt(addDays(-10)), eta: fmt(addDays(0)), releaseDate: fmt(addDays(-10)), materialReadyTime: '' },
    { id: '8', name: 'FPC', version: 'Replaceable', phase: 'DV2', supplier: '鏅椇鐢靛瓙', unit: '濂?, riskLevel: '涓?, remark: '', arrivalTime: '', requiredQty: 800, leadTimeDays: 12, demandConfirmDate: fmt(addDays(0)), eta: fmt(addDays(12)), releaseDate: fmt(addDays(-12)), materialReadyTime: '' },
    { id: '9', name: 'FPC', version: 'Non-replaceable', phase: 'DV2', supplier: '鏅椇鐢靛瓙', unit: '濂?, riskLevel: '楂?, remark: '', arrivalTime: '', requiredQty: 600, leadTimeDays: 20, demandConfirmDate: fmt(addDays(5)), eta: fmt(addDays(25)), releaseDate: fmt(addDays(-15)), materialReadyTime: '' },
    { id: '10', name: '鑰虫満鐢垫睜', version: 'Replaceable', phase: 'DV2', supplier: '璧ｉ攱閿備笟', unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: fmt(addDays(2)), requiredQty: 800, leadTimeDays: 1, demandConfirmDate: fmt(addDays(2)), eta: fmt(addDays(3)), releaseDate: fmt(addDays(2)), materialReadyTime: '' },
    { id: '11', name: '鑰虫満鐢垫睜', version: 'Non-replaceable', phase: 'PV', supplier: '璧ｉ攱閿備笟', unit: '濂?, riskLevel: '浣?, remark: '', arrivalTime: '', requiredQty: 600, leadTimeDays: 10, demandConfirmDate: fmt(addDays(-2)), eta: fmt(addDays(8)), releaseDate: fmt(addDays(-12)), materialReadyTime: '' },
    { id: '12', name: '鍏呯數鐩掔數姹?, version: '閫氱敤', phase: 'PV', supplier: '娆ｆ椇杈?, unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: '', requiredQty: 1000, leadTimeDays: 15, demandConfirmDate: fmt(addDays(-9)), eta: fmt(addDays(6)), releaseDate: fmt(addDays(-24)), materialReadyTime: '' },
    { id: '13', name: '澶╃嚎', version: 'Replaceable', phase: 'PV', supplier: '淇＄淮閫氫俊', unit: '濂?, riskLevel: '涓?, remark: '', arrivalTime: '', requiredQty: 800, leadTimeDays: 10, demandConfirmDate: fmt(addDays(-6)), eta: fmt(addDays(4)), releaseDate: fmt(addDays(-16)), materialReadyTime: '' },
    { id: '14', name: '澶╃嚎', version: 'Non-replaceable', phase: 'PV', supplier: '淇＄淮閫氫俊', unit: '濂?, riskLevel: '鏃?, remark: '', arrivalTime: fmt(addDays(0)), requiredQty: 600, leadTimeDays: 1, demandConfirmDate: fmt(addDays(0)), eta: fmt(addDays(1)), releaseDate: fmt(addDays(-1)), materialReadyTime: '' },
  ]
}

// 鏍锋満闇€姹傜粺璁★細鑰虫満/鍏呯數鐩?脳 鍙媶/涓嶅彲鎷嗭紝姣忕増鏈瘡棰滆壊锛氭姇浜с€佸疄闄呴渶姹傘€佸鎴锋牱鏈恒€佽瘯浜ц壇鐜?
const DEMAND_VERSION_KEYS = ['鑰虫満鍙媶', '鑰虫満涓嶅彲鎷?, '鍏呯數鐩掑彲鎷?, '鍏呯數鐩掍笉鍙媶']
const DEMAND_VERSION_LABELS = { '鑰虫満鍙媶': '鑰虫満-鍙媶', '鑰虫満涓嶅彲鎷?: '鑰虫満-涓嶅彲鎷?, '鍏呯數鐩掑彲鎷?: '鍏呯數鐩?鍙媶', '鍏呯數鐩掍笉鍙媶': '鍏呯數鐩?涓嶅彲鎷? }

function getInitialProductDemands() {
  const colors = ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊']
  const o = {}
  PHASES.forEach((phase) => {
    o[phase] = {}
    DEMAND_VERSION_KEYS.forEach((ver) => {
      o[phase][ver] = {}
      colors.forEach((c) => {
        const putIn = phase === 'DV1' ? (c === '榛戣壊' || c === '鐧借壊' ? 200 : 100) : phase === 'DV2' ? 150 : 100
        const actual = phase === 'DV1' ? 120 : phase === 'DV2' ? 80 : 50
        o[phase][ver][c] = { putInQty: putIn, structurePutInQty: 0, actualDemand: actual, customerSample: 0 }
      })
    })
  })
  return o
}

const STORAGE_KEY = 'tws-material-tracker-projects'
const STORAGE_KEY_BACKUP = 'tws-material-tracker-projects-backup'

// 椤圭洰璁″垝榛樿鑺傜偣锛圞ey Milestones锛?
const DEFAULT_PLAN_MILESTONES = [
  'Kick off', 'EV build', 'Gate2', 'Tooling start', 'T0', 'DV1 build', 'DV2 build', 'GATE 3', 'PV build', 'GATE 4', 'SOP (Start of Production)', 'Initial Production',
]
const DEFAULT_PLAN_COLUMNS = ['Original Plan', 'Actual plan']

// 鍏抽敭鐗╂枡闃舵璇曚骇鏃堕棿鍖洪棿锛堝彲鎷?/ 涓嶅彲鎷?脳 4 椤癸級
const PHASE_START_RANGE_LABELS = ['鍠囧彮璇曚骇', '鑰虫満鍓嶅姞宸?棣栦欢', '鑰虫満DV1鎵归噺璇曚骇', 'H瀹㈡埛鐪嬫媺']
function getDefaultPhaseStartRanges() {
  const empty = () => PHASE_START_RANGE_LABELS.map(() => ({ start: '', end: '' }))
  return { 鍙媶: empty(), 涓嶅彲鎷? empty() }
}

// 椤圭洰鎶€鏈偍澶囨ā鍧?
const TECH_MODULES = ['澹板', '缁撴瀯', '鐢靛瓙', '杞欢', '妯″叿', '涓氬姟']
function getDefaultTechReserve() {
  return TECH_MODULES.reduce((acc, m) => ({ ...acc, [m]: [] }), {})
}

// Workbook 闂璁板綍鍒嗙被
const WORKBOOK_CATEGORIES = ['Schedule', 'ID/ME', 'Acoustic/Call Quality', 'EE', 'SW', 'Compliance']

// 浜у搧瑙勬牸锛氫骇鍝佺被鍨嬨€佽摑鐗欑増鏈€侀槻姘寸瓑绾х瓑閫夐」
const PRODUCT_TYPES = ['TWS 鍏ヨ€冲紡', 'TWS 鍗婂叆鑰冲紡', 'TWS 澶存埓寮?, '棰堟寕寮?, '楠ㄤ紶瀵?, '鍏朵粬']
const BLUETOOTH_VERSIONS = ['钃濈墮 5.0', '钃濈墮 5.1', '钃濈墮 5.2', '钃濈墮 5.3', '钃濈墮 5.4', '鍏朵粬']
const WATERPROOF_LEVELS = ['鏃?, 'IPX4', 'IPX5', 'IPX6', 'IPX7', 'IP54', 'IP55', '鍏朵粬']
const VERSION_STRATEGIES = ['鏍囧噯鐗堬紙鐢垫睜涓嶅彲鎷嗗嵏锛?, '鍙寔缁増锛堢數姹犲彲鎷嗗嵏锛?, '鍙岀増鏈彲閫?]
const TOUCH_CONTROLS = ['鐢靛寮忚Е鎺?, '鍘嬪姏鎰熷簲', '鐢靛寮?+ 鍘嬪姏鎰熷簲鍙€?]
const WEAR_DETECTIONS = ['绾㈠ (IR)', '鐢靛寮?, '绾㈠ + 鐢靛寮?]
const YES_NO = ['鏄?, '鍚?]
const DRIVER_TYPES = ['澶у枃鍙?(Large Horn)', '鍔ㄥ湀', '鍔ㄩ搧', '鍦堥搧', '鍏朵粬']
const AUDIO_CODECS = ['SBC', 'AAC', 'SBC + AAC', 'SBC + AAC + LE Audio (LC3)', '鍏朵粬']

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

// 榛樿鍗曢」鐩畬鏁寸姸鎬侊紙鐢ㄤ簬鏂板缓 + 鎸佷箙鍖栵級
function getDefaultProjectState() {
  const materials = getInitialMaterials()
  const phases = PHASES
  const defaultColors = ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊']
  const productColorsByPhase = { EV: [...defaultColors], DV1: [...defaultColors], DV2: [...defaultColors], PV: [...defaultColors] }
  const productDemands = {}
  PHASES.forEach((phase) => {
    productDemands[phase] = {}
    DEMAND_VERSION_KEYS.forEach((ver) => {
      productDemands[phase][ver] = {}
      defaultColors.forEach((c) => {
        const putIn = phase === 'DV1' ? (c === '榛戣壊' || c === '鐧借壊' ? 200 : 100) : phase === 'DV2' ? 150 : 100
        const actual = phase === 'DV1' ? 120 : phase === 'DV2' ? 80 : 50
        productDemands[phase][ver][c] = { putInQty: putIn, structurePutInQty: 0, actualDemand: actual, customerSample: 0 }
      })
    })
  })
  return {
    projectName: '鏈懡鍚嶉」鐩?,
    mdrNumber: '',
    projectProductImage: null,
    materials,
    productDemands,
    productColorsByPhase,
    filterVersion: '鍏ㄩ儴',
    filterPhase: 'DV1',
    phaseStartDates: { EV: '', DV1: '', DV2: '', PV: '' },
    phaseStartRanges: getDefaultPhaseStartRanges(),
    trialProductionTime: '',
    distributionRecords: [],
    projectPlanMilestones: DEFAULT_PLAN_MILESTONES.map((label, i) => ({ id: `pm_${i}`, label })),
    projectPlanColumns: DEFAULT_PLAN_COLUMNS.map((name, i) => ({ id: `pc_${i}`, name })),
    projectPlanCells: {},
    projectPlanComments: {},
    customerTeamMembers: [],
    internalMembers: [],
    workbookEntries: WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}),
    trialIssues: { EV: [], DV1: [], DV2: [], PV: [] },
    fileLibrary: [],
    techReserve: getDefaultTechReserve(),
    productSpec: getDefaultProductSpec(),
  }
}

// 浠?localStorage 璇诲彇椤圭洰鍒楄〃
function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// 淇濆瓨椤圭洰鍒楄〃鍒?localStorage
function saveProjects(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error(e)
  }
}

// ---------- 宸ュ叿鍑芥暟 ----------
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

// 绠€鍗曞瘜鏂囨湰缂栬緫鍣紙鏀寔鍔犵矖銆佸垪琛ㄣ€佸浘鐗囨彃鍏ヤ笌绮樿创鍥剧墖锛?
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
        <span className="mr-1">鏍煎紡</span>
        <button type="button" onClick={() => exec('bold')} className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-semibold">
          B
        </button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="px-1.5 py-0.5 rounded hover:bg-slate-200">
          鈥?鍒楄〃
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('杈撳叆鍥剧墖鍦板潃锛圲RL锛?)
            if (url) exec('insertImage', url)
          }}
          className="px-1.5 py-0.5 rounded hover:bg-slate-200"
        >
          鍥剧墖
        </button>
        <span className="ml-auto text-slate-400">鍙洿鎺ョ矘璐村壀璐存澘鍥剧墖</span>
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

/** 鏍规嵁褰撳墠鏃ユ湡涓?ETA 鐨勫ぉ鏁板樊杩斿洖鍏抽敭鐗╂枡琛岀殑鑳屾櫙鏍峰紡锛氣墹20 澶╄摑锛?12 澶╅粍锛?7 澶╃孩 */
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

// ---------- 涓诲簲鐢?----------
export default function App() {
  const [projects, setProjects] = useState(() => loadProjects())
  const [view, setView] = useState(() => (loadProjects().length === 0 ? 'editor' : 'list'))
  const [currentProjectId, setCurrentProjectId] = useState(null)

  // 褰撳墠缂栬緫鐨勯」鐩姸鎬侊紙浠呭湪 view === 'editor' 鏃朵娇鐢級
  const [projectName, setProjectName] = useState('鏈懡鍚嶉」鐩?)
  const [mdrNumber, setMdrNumber] = useState('')
  const [projectProductImage, setProjectProductImage] = useState(null)
  const [materials, setMaterials] = useState(() => getInitialMaterials())
  const [productDemands, setProductDemands] = useState(() => getInitialProductDemands())
  const [productColorsByPhase, setProductColorsByPhase] = useState(() => ({
    EV: ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊'],
    DV1: ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊'],
    DV2: ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊'],
    PV: ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊'],
  }))
  const productDemandsRef = useRef(productDemands)
  const productColorsByPhaseRef = useRef(productColorsByPhase)
  useEffect(() => {
    productDemandsRef.current = productDemands
    productColorsByPhaseRef.current = productColorsByPhase
  }, [productDemands, productColorsByPhase])
  const [productTableRowOrder, setProductTableRowOrder] = useState(() => [...DEFAULT_TABLE_ROW_ORDER])
  const [productDemandPhase, setProductDemandPhase] = useState('DV1')
  const [demandEarphoneMode, setDemandEarphoneMode] = useState('鍙媶涓嶅彲鎷?) // '鍙媶涓嶅彲鎷? | '閫氱敤'
  const [demandChargerMode, setDemandChargerMode] = useState('鍙媶涓嶅彲鎷?)   // '鍙媶涓嶅彲鎷? | '閫氱敤'
  const [editingColorPhase, setEditingColorPhase] = useState(null)
  const [editingColorKey, setEditingColorKey] = useState(null)
  const [editingColorValue, setEditingColorValue] = useState('')
  const [filterVersion, setFilterVersion] = useState('鍏ㄩ儴')
  const [filterPhase, setFilterPhase] = useState('DV1')
  const [phaseStartDates, setPhaseStartDates] = useState(() => ({ DV1: '', DV2: '', PV: '' }))
  const [phaseStartRanges, setPhaseStartRanges] = useState(() => getDefaultPhaseStartRanges())
  const [trialProductionTime, setTrialProductionTime] = useState('')
  const [phaseStartRangesExpanded, setPhaseStartRangesExpanded] = useState(false)
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
  const [projectPlanComments, setProjectPlanComments] = useState(() => ({}))
  // 鏂板锛氶」鐩鍒掗〉闈㈠拰鐢樼壒鍥炬暟鎹?
  const [planPages, setPlanPages] = useState([{ id: 'milestone', name: '閲岀▼纰戣妭鐐?, type: 'milestone' }])
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
  
  // 璇曚骇闂鐐圭姸鎬?
  const [showTrialIssues, setShowTrialIssues] = useState(false)
  const [trialIssuesPhase, setTrialIssuesPhase] = useState('DV1')
  const [trialIssues, setTrialIssues] = useState(() => ({ EV: [], DV1: [], DV2: [], PV: [] }))
  const [trialIssuesSaveHint, setTrialIssuesSaveHint] = useState(false)
  const [trialIssueModal, setTrialIssueModal] = useState(false)
  const [editingTrialIssue, setEditingTrialIssue] = useState(null)
  const [trialIssueForm, setTrialIssueForm] = useState({
    description: '',
    owner: '',
    project: '',
    cause: '',
    priority: '涓?,
    closeTime: '',
    status: '寰呭鐞?
  })
  
  // 鏂囦欢搴撶姸鎬?
  const [showFileLibrary, setShowFileLibrary] = useState(false)
  const [fileLibrary, setFileLibrary] = useState(() => [])
  const [fileLibrarySaveHint, setFileLibrarySaveHint] = useState(false)
  const [fileUploadModal, setFileUploadModal] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [fileForm, setFileForm] = useState({ type: '瑙勬牸涔?, version: '', description: '' })
  const [fileFilter, setFileFilter] = useState('')
  const [fileSearch, setFileSearch] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [showProductSpec, setShowProductSpec] = useState(false)
  const [productSpec, setProductSpec] = useState(() => getDefaultProductSpec())
  const [productSpecSaveHint, setProductSpecSaveHint] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    version: '閫氱敤',
    phase: 'DV1',
    supplier: '',
    unit: '濂?,
    riskLevel: '鏃?,
    remark: '',
    arrivalTime: '',
    requiredQty: 0,
    leadTimeDays: 0,
    eta: new Date().toISOString().slice(0, 10),
    releaseDate: '',
    materialReadyTime: '',
  })

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
    setTrialProductionTime(def.trialProductionTime || '')
    setDistributionRecords(def.distributionRecords || [])
    setDistributionStageFilter('EV')
    setCurrentProjectId(null)
    setProjectPlanMilestones(def.projectPlanMilestones || DEFAULT_PLAN_MILESTONES.map((l, i) => ({ id: `pm_${i}`, label: l })))
    setProjectPlanColumns(def.projectPlanColumns || DEFAULT_PLAN_COLUMNS.map((n, i) => ({ id: `pc_${i}`, name: n })))
    setProjectPlanCells(def.projectPlanCells || {})
    setProjectPlanComments(def.projectPlanComments || {})
    setPlanPages(def.planPages || [{ id: 'milestone', name: '閲岀▼纰戣妭鐐?, type: 'milestone' }])
    setGanttPlans(def.ganttPlans || {})
    setCustomerTeamMembers(def.customerTeamMembers || [])
    setInternalMembers(def.internalMembers || [])
    setWorkbookEntries(def.workbookEntries || WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}))
    setTrialIssues(def.trialIssues || { EV: [], DV1: [], DV2: [], PV: [] })
    setFileLibrary(def.fileLibrary || [])
    setMdrNumber(def.mdrNumber || '')
    setProjectProductImage(def.projectProductImage ?? null)
    setProductSpec(def.productSpec || getDefaultProductSpec())
      return
    }
    setProjectName(project.projectName || project.name || '鏈懡鍚嶉」鐩?)
    setMaterials(project.materials || getInitialMaterials())
    const migrateKey = (k) => (k === '鍙媶' ? 'Replaceable' : k === '涓嶅彲鎷? ? 'Non-replaceable' : k === '瀹㈡埛瀹為檯闇€姹?鍙媶' ? '瀹㈡埛瀹為檯闇€姹?Replaceable' : k === '瀹㈡埛瀹為檯闇€姹?涓嶅彲鎷? ? '瀹㈡埛瀹為檯闇€姹?Non-replaceable' : k)
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
            out[phase] = { '鑰虫満鍙媶': {}, '鑰虫満涓嶅彲鎷?: {}, '鍏呯數鐩掑彲鎷?: {}, '鍏呯數鐩掍笉鍙媶': {} }
            const phaseData = rawDemands[phase] || {}
            const colors = project.productColorsByPhase?.[phase] || ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊']
            const getVal = (rowKey, c) => Number(phaseData[rowKey]?.[c]) || 0
            colors.forEach((c) => {
              const putInR = getVal('Replaceable', c)
              const actualR = getVal('瀹㈡埛瀹為檯闇€姹?Replaceable', c)
              const putInN = getVal('Non-replaceable', c)
              const actualN = getVal('瀹㈡埛瀹為檯闇€姹?Non-replaceable', c)
              out[phase]['鑰虫満鍙媶'][c] = { putInQty: putInR, structurePutInQty: 0, actualDemand: actualR, customerSample: 0 }
              out[phase]['鑰虫満涓嶅彲鎷?][c] = { putInQty: putInN, structurePutInQty: 0, actualDemand: actualN, customerSample: 0 }
              out[phase]['鍏呯數鐩掑彲鎷?][c] = { putInQty: putInR, structurePutInQty: 0, actualDemand: actualR, customerSample: 0 }
              out[phase]['鍏呯數鐩掍笉鍙媶'][c] = { putInQty: putInN, structurePutInQty: 0, actualDemand: actualN, customerSample: 0 }
            })
          })
          return out
        })()
    // 纭繚鍚?EV 闃舵鍙婃瘡 cell 鍚?structurePutInQty
    PHASES.forEach((p) => {
      if (!migratedDemands[p]) {
        migratedDemands[p] = { '鑰虫満鍙媶': {}, '鑰虫満涓嶅彲鎷?: {}, '鍏呯數鐩掑彲鎷?: {}, '鍏呯數鐩掍笉鍙媶': {} }
        const colors = project.productColorsByPhase?.[p] || ['榛戣壊', '鐧借壊', '钃濊壊', '缁胯壊']
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
    setProductColorsByPhase({ EV: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], DV1: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], DV2: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], PV: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], ...(project.productColorsByPhase || {}) })
    productDemandsRef.current = migratedDemands
    productColorsByPhaseRef.current = { EV: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], DV1: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], DV2: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], PV: ['榛戣壊','鐧借壊','钃濊壊','缁胯壊'], ...(project.productColorsByPhase || {}) }
    const rawOrder = project.productTableRowOrder || [...DEFAULT_TABLE_ROW_ORDER]
    setProductTableRowOrder(rawOrder.map(migrateKey))
    setProductDemandPhase('DV1')
    setFilterVersion(project.filterVersion || '鍏ㄩ儴')
    setFilterPhase(project.filterPhase || 'DV1')
    setPhaseStartDates({ EV: '', DV1: '', DV2: '', PV: '', ...(project.phaseStartDates || {}) })
    setPhaseStartRanges(project.phaseStartRanges ? (() => {
      const def = getDefaultPhaseStartRanges()
      const norm = (arr) => (arr || []).slice(0, 4).map((r, i) => ({ start: r?.start ?? '', end: r?.end ?? '' }))
      const 鍙媶 = norm(project.phaseStartRanges.鍙媶)
      const 涓嶅彲鎷?= norm(project.phaseStartRanges.涓嶅彲鎷?
      while (鍙媶.length < 4) 鍙媶.push({ start: '', end: '' })
      while (涓嶅彲鎷?length < 4) 涓嶅彲鎷?push({ start: '', end: '' })
      return { 鍙媶, 涓嶅彲鎷?}
    })() : getDefaultPhaseStartRanges())
    setTrialProductionTime(project.trialProductionTime || '')
    setTechReserve(project.techReserve || getDefaultTechReserve())
    setDistributionRecords(project.distributionRecords || [])
    setDistributionStageFilter('EV')
    setProjectPlanMilestones(project.projectPlanMilestones || DEFAULT_PLAN_MILESTONES.map((l, i) => ({ id: `pm_${i}`, label: l })))
    setProjectPlanColumns(project.projectPlanColumns || DEFAULT_PLAN_COLUMNS.map((n, i) => ({ id: `pc_${i}`, name: n })))
    setProjectPlanCells(project.projectPlanCells || {})
    setProjectPlanComments(project.projectPlanComments || {})
    setPlanPages(project.planPages || [{ id: 'milestone', name: '閲岀▼纰戣妭鐐?, type: 'milestone' }])
    setGanttPlans(project.ganttPlans || {})
    setCustomerTeamMembers(project.customerTeamMembers || [])
    setInternalMembers(project.internalMembers || [])
    setWorkbookEntries(project.workbookEntries || WORKBOOK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {}))
    setTrialIssues(project.trialIssues || { EV: [], DV1: [], DV2: [], PV: [] })
    setFileLibrary(project.fileLibrary || [])
    setMdrNumber(project.mdrNumber || '')
    setProjectProductImage(project.projectProductImage ?? null)
    setProductSpec(project.productSpec ? { ...getDefaultProductSpec(), ...project.productSpec } : getDefaultProductSpec())
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
      trialProductionTime,
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
      currentProjectId,
      projects,
    }
    const doSave = () => {
      const latestDemands = productDemandsRef.current ?? capture.productDemands
      const latestColorsByPhase = productColorsByPhaseRef.current ?? capture.productColorsByPhase
      const state = {
        projectName: capture.projectName,
        mdrNumber: capture.mdrNumber,
        projectProductImage: capture.projectProductImage,
        materials: capture.materials,
        productDemands: latestDemands,
        productColorsByPhase: latestColorsByPhase,
        productTableRowOrder: capture.productTableRowOrder,
        filterVersion: capture.filterVersion,
        filterPhase: capture.filterPhase,
        phaseStartDates: capture.phaseStartDates,
        phaseStartRanges: capture.phaseStartRanges,
        trialProductionTime: capture.trialProductionTime,
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
        trialIssues: capture.trialIssues,
        fileLibrary: capture.fileLibrary,
        techReserve: capture.techReserve,
        productSpec: capture.productSpec,
      }
      const id = capture.currentProjectId || `p_${Date.now()}`
      const name = (capture.projectName || '').trim() || '鏈懡鍚嶉」鐩?
      const savedAt = Date.now()
      const list = (capture.projects || []).filter((p) => p.id !== id)
      list.unshift({ id, name, savedAt, ...state })
      setProjects(list)
      saveProjects(list)
      setCurrentProjectId(id)
      setProjectName(name)
      if (!silent) window.alert('宸蹭繚瀛?)
    }
    doSave()
  }

  const handleExportBackup = () => {
    const data = {
      backupAt: new Date().toISOString(),
      app: 'TWS 璇曚骇闀垮懆鏈熺墿鏂欒拷韪潰鏉?,
      projectCount: projects.length,
      projects,
    }
    const json = JSON.stringify(data, null, 2)
    // 澶囦唤锛氬啓鍏ユ湰鍦板浠介敭锛屼究浜庡悗缁粠澶囦唤鎭㈠
    try {
      localStorage.setItem(STORAGE_KEY_BACKUP, json)
    } catch (e) {
      console.error('澶囦唤鍐欏叆澶辫触', e)
    }
    // 瀵煎嚭锛氫笅杞?JSON 鏂囦欢
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TWS鐗╂枡杩借釜_鍏ㄩ儴椤圭洰_澶囦唤_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    window.alert('宸插鍑烘枃浠跺苟宸插浠藉埌鏈湴銆?)
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
            window.alert('鎵€閫夋枃浠朵腑娌℃湁椤圭洰鏁版嵁鎴栨牸寮忎笉姝ｇ‘銆?)
            return
          }
          if (!window.confirm(`纭畾浠庢墍閫夋枃浠舵仮澶嶏紵灏嗙敤鏂囦欢涓殑 ${list.length} 涓」鐩鐩栧綋鍓嶉」鐩垪琛ㄣ€俙)) return
          setProjects(list)
          saveProjects(list)
          window.alert('宸蹭粠鎵€閫夋枃浠舵仮澶嶃€?)
        } catch (err) {
          console.error(err)
          window.alert('鎭㈠澶辫触锛氳閫夋嫨鏈簲鐢ㄥ鍑虹殑 JSON 澶囦唤鏂囦欢銆?)
        }
      }
      reader.readAsText(file, 'UTF-8')
    }
    input.click()
  }

  const handleBackToList = () => {
    handleSave({ silent: true })
    setShowTrialIssues(false)
    setShowFileLibrary(false)
    setShowWorkbook(false)
    setShowProjectPlan(false)
    setShowProjectMembers(false)
    setShowTechReserve(false)
    setShowProductSpec(false)
    setShowDistributionList(false)
    setView('list')
  }

  const handleDeleteProject = (id) => {
    if (!window.confirm('纭畾鍒犻櫎璇ラ」鐩紵')) return
    const list = projects.filter((p) => p.id !== id)
    setProjects(list)
    saveProjects(list)
  }

  const handleCopyProject = (project) => {
    const copy = { ...project, id: `p_${Date.now()}`, name: `${project.name || project.projectName || '鏈懡鍚嶉」鐩?} - 鍓湰`, savedAt: Date.now() }
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
    setProjectPlanColumns((prev) => [...prev, { id: `pc_${Date.now()}`, name: '鏂板垪' }])
  }
  const deleteProjectPlanColumn = (colId) => {
    if (projectPlanColumns.length <= 1) { window.alert('鑷冲皯淇濈暀涓€鍒?); return }
    if (!window.confirm('纭畾鍒犻櫎璇ュ垪锛熻鍒椾笅鎵€鏈夋棩鏈熸暟鎹皢涓€骞舵竻闄ゃ€?)) return
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
    setProjectPlanMilestones((prev) => [...prev, { id: `pm_${Date.now()}`, label: '鏂拌妭鐐? }])
  }
  const deleteProjectPlanMilestone = (milestoneId) => {
    if (projectPlanMilestones.length <= 1) { window.alert('鑷冲皯淇濈暀涓€琛?); return }
    if (!window.confirm('纭畾鍒犻櫎璇ヨ锛熻鑺傜偣鍙婂娉ㄥ皢涓€骞舵竻闄ゃ€?)) return
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

  const addWorkbookEntry = (category) => {
    setWorkbookEntries((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: `wb_${Date.now()}`, content: '', responsiblePerson: '', raisedTime: '', riskLevel: '鏃? }],
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

  // 璇曚骇闂鐐癸細澧炲垹鏀?
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
      description: '',
      owner: '',
      project: '',
      cause: '',
      priority: '涓?,
      closeTime: '',
      status: '寰呭鐞?
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
    if (!window.confirm('纭畾鍒犻櫎璇ラ棶棰樼偣锛?)) return
    setTrialIssues((prev) => ({
      ...prev,
      [trialIssuesPhase]: (prev[trialIssuesPhase] || []).filter((e) => e.id !== id)
    }))
  }

  // 鏂囦欢搴擄細澧炲垹鏀?
  const handleFileDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setPendingFiles(files)
    setFileUploadModal(true)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setPendingFiles(files)
    setFileUploadModal(true)
  }

  const uploadFiles = () => {
    pendingFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileData = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: fileForm.type,
          version: fileForm.version || 'V1.0',
          description: fileForm.description,
          data: e.target.result,
          uploadedAt: new Date().toISOString()
        }
        setFileLibrary((prev) => [...prev, fileData])
      }
      reader.readAsDataURL(file)
    })
    setFileUploadModal(false)
    setPendingFiles([])
    setFileForm({ type: '瑙勬牸涔?, version: '', description: '' })
  }

  const deleteFile = (id) => {
    if (!window.confirm('纭畾鍒犻櫎璇ユ枃浠讹紵')) return
    setFileLibrary((prev) => prev.filter((f) => f.id !== id))
  }

  const downloadFile = (file) => {
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    link.click()
  }

  // 鎶€鏈偍澶囷細澧炲垹鏀?
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
    if (!window.confirm('纭畾鍒犻櫎璇ユ潯鎶€鏈偍澶囷紵')) return
    setTechReserve((prev) => ({
      ...prev,
      [module]: (prev[module] || []).filter((e) => e.id !== id),
    }))
    setTechActiveId(null)
  }
  const exportWorkbookToExcel = () => {
    const wb = XLSX.utils.book_new()
    const rows = [['Category', 'Actions or Details', '璐ｄ换浜?, '闂鎻愬嚭鏃堕棿', '椋庨櫓绋嬪害']]
    WORKBOOK_CATEGORIES.forEach((cat) => {
      (workbookEntries[cat] || []).forEach((e) => {
        rows.push([cat, e.content || '', e.responsiblePerson || '', e.raisedTime || '', e.riskLevel || ''])
      })
    })
    if (rows.length === 1) rows.push(['', '', '', '', ''])
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const name = `${(projectName || '椤圭洰闂鐐?).replace(/[/\\?*\[\]:]/g, '_')}_椤圭洰闂鐐筥${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.utils.book_append_sheet(wb, ws, 'Issues')
    XLSX.writeFile(wb, name)
  }

  const exportDistributionExcel = () => {
    const headers = ['鏍峰搧闃舵', '鑰虫満(濂?', '鍏呯數鐩?, 'PCBA', '鑰虫満缁撴瀯鎵嬫澘', '棰滆壊', '鍏徃', '棰嗙敤浜?, '璐熻矗浜?, '棰嗙敤鏃堕棿', '澶囨敞']
    const rows = [headers]
    distributionRecords.forEach((r) => {
      rows.push([r.stage || '', r.earphoneSet || '', r.charging || '', r.pcba || '', r.structureHand || '', r.color || '', r.company || '', r.recipient || '', r.personInCharge || '', r.receiptTime || '', r.remark || ''])
    })
    if (rows.length === 1) rows.push(headers.map(() => ''))
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '鏍锋満鍒嗗彂')
    XLSX.writeFile(wb, `${(projectName || '椤圭洰').replace(/[/\\?*\[\]:]/g, '_')}_鏍锋満鍒嗗彂_${new Date().toISOString().slice(0, 10)}.xlsx`)
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
      } catch (err) { console.error(err); window.alert('瀵煎叆澶辫触锛岃妫€鏌ユ枃浠舵牸寮?) }
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
    XLSX.utils.book_append_sheet(wb, ws, '椤圭洰璁″垝')
    XLSX.writeFile(wb, `${(projectName || '椤圭洰').replace(/[/\\?*\[\]:]/g, '_')}_椤圭洰璁″垝_${new Date().toISOString().slice(0, 10)}.xlsx`)
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
        const newCols = colNames.map((name, i) => ({ id: `pc_${Date.now()}_${i}`, name: String(name || '').trim() || `鍒?{i + 1}` }))
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
      } catch (err) { console.error(err); window.alert('瀵煎叆澶辫触锛岃妫€鏌ユ枃浠舵牸寮?) }
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  const exportMembersExcel = () => {
    const wb = XLSX.utils.book_new()
    const customerRows = [['绫诲瀷', '鑱屼綅', '鍚嶇О', '閭欢', '鐢佃瘽', '澶囨敞']]
    customerTeamMembers.forEach((m) => customerRows.push(['瀹㈡埛', m.role || '', m.name || '', m.email || '', m.phone || '', m.remark || '']))
    internalMembers.forEach((m) => customerRows.push(['鍐呴儴', m.role || '', m.name || '', m.email || '', m.phone || '', m.remark || '']))
    if (customerRows.length === 1) customerRows.push(customerRows[0].map(() => ''))
    const ws = XLSX.utils.aoa_to_sheet(customerRows)
    XLSX.utils.book_append_sheet(wb, ws, '椤圭洰鎴愬憳')
    XLSX.writeFile(wb, `${(projectName || '椤圭洰').replace(/[/\\?*\[\]:]/g, '_')}_椤圭洰鎴愬憳_${new Date().toISOString().slice(0, 10)}.xlsx`)
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
          if (type === '鍐呴儴') internal.push(rec)
          else customer.push(rec)
        }
        if (customer.length) setCustomerTeamMembers((prev) => [...prev, ...customer])
        if (internal.length) setInternalMembers((prev) => [...prev, ...internal])
      } catch (err) { console.error(err); window.alert('瀵煎叆澶辫触锛岃妫€鏌ユ枃浠舵牸寮?) }
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  const exportDemandExcel = () => {
    const phase = productDemandPhase
    const colors = productColorsByPhase[phase] || []
    const earphoneVersions = demandEarphoneMode === '閫氱敤' ? ['鑰虫満鍙媶'] : ['鑰虫満鍙媶', '鑰虫満涓嶅彲鎷?]
    const chargerVersions = demandChargerMode === '閫氱敤' ? ['鍏呯數鐩掑彲鎷?] : ['鍏呯數鐩掑彲鎷?, '鍏呯數鐩掍笉鍙媶']
    const earphoneLabels = demandEarphoneMode === '閫氱敤' ? { '鑰虫満鍙媶': '閫氱敤' } : { '鑰虫満鍙媶': '鑰虫満-鍙媶', '鑰虫満涓嶅彲鎷?: '鑰虫満-涓嶅彲鎷? }
    const chargerLabels = demandChargerMode === '閫氱敤' ? { '鍏呯數鐩掑彲鎷?: '閫氱敤' } : { '鍏呯數鐩掑彲鎷?: '鍏呯數鐩?鍙媶', '鍏呯數鐩掍笉鍙媶': '鍏呯數鐩?涓嶅彲鎷? }
    const buildSection = (versionKeys, versionLabels, showCustomerSample) => {
      const headerRow = ['棰滆壊']
      versionKeys.forEach((ver) => {
        const label = versionLabels[ver]
        headerRow.push(`${label}-涓绘澘鎶曚骇`, `${label}-缁撴瀯澶囨枡`, `${label}-瀹為檯闇€姹俙)
        if (showCustomerSample) headerRow.push(`${label}-瀹㈡埛鏍锋満`)
        headerRow.push(`${label}-璇曚骇鑹巼%`)
      })
      const rows = [headerRow]
      colors.forEach((color) => {
        const row = [color]
        versionKeys.forEach((ver) => {
          const cell = (productDemands[phase]?.[ver]?.[color]) || { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
          const putIn = Number(cell.putInQty) || 0
          const actual = Number(cell.actualDemand) || 0
          const yieldPct = putIn > 0 && actual > 0 ? Math.min(100, Math.round((actual / putIn) * 100)) : ''
          row.push(cell.putInQty ?? '', cell.structurePutInQty ?? '', cell.actualDemand ?? '')
          if (showCustomerSample) row.push(cell.customerSample ?? '')
          row.push(yieldPct !== '' ? `${yieldPct}%` : '')
        })
        rows.push(row)
      })
      const sumRow = ['鍚堣']
      versionKeys.forEach((ver) => {
        let putInSum = 0, structureSum = 0, actualSum = 0, customerSum = 0
        colors.forEach((c) => {
          const cell = (productDemands[phase]?.[ver]?.[c]) || {}
          putInSum += Number(cell.putInQty) || 0
          structureSum += Number(cell.structurePutInQty) || 0
          actualSum += Number(cell.actualDemand) || 0
          customerSum += Number(cell.customerSample) || 0
        })
        sumRow.push(putInSum, structureSum, actualSum)
        if (showCustomerSample) sumRow.push(customerSum)
        sumRow.push('鈥?)
      })
      rows.push(sumRow)
      return rows
    }
    const rows = [
      [`鏍锋満闇€姹傜粺璁?- 闃舵 ${phase}`, ''],
      [],
      ['鑰虫満'],
      ...buildSection(earphoneVersions, earphoneLabels, true),
      [],
      ['鍏呯數鐩?],
      ...buildSection(chargerVersions, chargerLabels, false),
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '鏍锋満闇€姹傜粺璁?)
    XLSX.writeFile(wb, `${(projectName || '椤圭洰').replace(/[/\\?*\[\]:]/g, '_')}_鏍锋満闇€姹傜粺璁${phase}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // 浠?DV1 涓哄熀鍑嗙殑鍏抽敭鐗╂枡閿紙鍚嶇О+椤哄簭涓€鑷达級锛涘鍒犱互 DV1 涓哄噯锛屽洓闃舵鍚屾锛涙暟閲?鏃堕棿绛夊悇闃舵鍙崟鐙紪杈?
  const getMaterialRow = (name, version, phase) =>
    materials.find((m) => m.name === name && (m.version || '閫氱敤') === version && (m.phase || 'DV1') === phase)

  const keyMaterialKeys = useMemo(() => {
    const dv1Rows = materials.filter((m) => (m.phase || 'DV1') === 'DV1')
    const seen = new Set()
    return dv1Rows
      .filter((m) => {
        const k = `${m.name}\0${m.version || '閫氱敤'}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .map((m) => ({ name: m.name, version: m.version || '閫氱敤' }))
  }, [materials])

  const displayedKeyMaterialKeys = useMemo(() => {
    return filterVersion === '鍏ㄩ儴' ? keyMaterialKeys : keyMaterialKeys.filter((k) => k.version === filterVersion)
  }, [keyMaterialKeys, filterVersion])

  // 褰撳墠闃舵涓嬬敤浜庤〃鏍煎睍绀虹殑琛岋紙姣忎釜 key 涓€鏉★紝鏃犲垯鐢ㄥ崰浣嶆暟鎹級
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
          unit: dv1?.unit || '濂?,
          riskLevel: dv1?.riskLevel || '鏃?,
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
      // 濡傛灉淇敼浜嗗鏂欏懆鏈熸垨寮€濮嬩氦鏂欐棩鏈燂紝閲嶆柊璁＄畻鏀捐鏃ユ湡
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
    // 榻愭枡鏃堕棿榛樿绛変簬寮€濮嬩氦鏂欐棩鏈?
    const materialReadyTime = newEta || ''
    setMaterials((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${phase}`,
        name: key.name,
        version: key.version,
        phase,
        supplier: dv1.supplier || '',
        unit: dv1.unit || '濂?,
        riskLevel: dv1.riskLevel || '鏃?,
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
    if (!window.confirm(`纭畾鍒犻櫎鐗╂枡銆?{key.name}銆?{key.version !== '閫氱敤' ? `锛?{key.version}锛塦 : ''}锛熷皢鍚屾椂鍒犻櫎鍏跺湪 EV/DV1/DV2/PV 鐨勬暟鎹€俙)) return
    setMaterials((prev) => prev.filter((m) => !(m.name === key.name && (m.version || '閫氱敤') === key.version)))
  }

  const reorderMaterialsByKeyOrder = (prevMaterials, keyOrder) => {
    const result = []
    keyOrder.forEach((k) => {
      PHASES.forEach((phase) => {
        const row = prevMaterials.find((m) => m.name === k.name && (m.version || '閫氱敤') === k.version && (m.phase || 'DV1') === phase)
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
        m.name === key.name && (m.version || '閫氱敤') === key.version ? { ...m, [field]: value } : m
      )
    )
  }

  const updatePhaseStartRange = (type, index, field, value) => {
    setPhaseStartRanges((prev) => ({
      ...prev,
      [type]: prev[type].map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }))
  }

  // 绛涢€夊悗鐨勫垪琛紙鎸?key 灞曠ず鏃剁敤浜庡吋瀹圭粺璁＄瓑锛岀粺璁′粛鎸夊叏閮ㄧ墿鏂欙級
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchVersion = filterVersion === '鍏ㄩ儴' || m.version === filterVersion
      const matchPhase = (m.phase || 'DV1') === filterPhase
      return matchVersion && matchPhase
    })
  }, [materials, filterVersion, filterPhase])

  // 鍏ㄥ眬缁熻锛堝叧閿墿鏂欓」鏁?= 浠?DV1 涓哄熀鍑嗙殑鐗╂枡閿暟閲忥級
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

  // 鏇存柊鍗曡瀛楁锛堟暟閲忋€佸悕绉般€佺増鏈€侀鑹层€佷緵搴斿晢绛夛級
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

  // 鍒犻櫎涓€琛岀墿鏂?
  const deleteMaterial = (id) => {
    if (window.confirm('纭畾鍒犻櫎璇ョ墿鏂欓」锛?)) {
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    }
  }

  // 鐗╂枡琛屼笂绉?涓嬬Щ
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

  // 鏇存柊鏍锋満闇€姹傦紙闃舵 脳 鐗堟湰 脳 棰滆壊 脳 瀛楁锛?
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

  // 鍥哄畾瀹為檯闇€姹傛暟閲忥紝杈撳叆璇曚骇鑹巼鍚庡弽绠椾富鏉挎姇浜ф暟閲忥細涓绘澘鎶曚骇鏁伴噺 = ceil(瀹為檯闇€姹傛暟閲?/ (鑹巼%/100))
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

  // 娣诲姞浜у搧棰滆壊鍒楋紙浠呭綋鍓嶉樁娈碉級
  const addProductColor = (phase) => {
    const name = window.prompt('杈撳叆鏂伴鑹插悕绉?, '鏂伴鑹?)
    if (!name || !name.trim()) return
    const trimmed = name.trim()
    const colors = productColorsByPhase[phase] || []
    if (colors.includes(trimmed)) {
      window.alert('璇ラ樁娈典笅璇ラ鑹插凡瀛樺湪')
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

  // 閲嶅懡鍚嶄骇鍝侀鑹诧紙浠呭綋鍓嶉樁娈碉級
  const renameProductColor = (phase, oldName, newName) => {
    const trimmed = (newName || '').trim()
    if (!trimmed || trimmed === oldName) return
    const colors = productColorsByPhase[phase] || []
    if (colors.some((c) => c !== oldName && c === trimmed)) {
      window.alert('璇ラ樁娈典笅璇ラ鑹插悕绉板凡瀛樺湪')
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

  // 鍒犻櫎浜у搧棰滆壊鍒楋紙浠呭綋鍓嶉樁娈碉級
  const removeProductColor = (phase, color) => {
    const colors = productColorsByPhase[phase] || []
    if (colors.length <= 1) {
      window.alert('鑷冲皯淇濈暀涓€涓鑹?)
      return
    }
    if (!window.confirm(`纭畾鍦ㄨ闃舵鍒犻櫎棰滆壊銆?{color}銆嶏紵`)) return
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

  // 娣诲姞鏂扮墿鏂欙紙EV/DV1/DV2/PV 鍚勪竴鏉★紝渚夸簬鍥涢樁娈靛悓琛ㄧ紪杈戯級
  const addMaterial = () => {
    if (!newItem.name.trim()) return
    const days = Number(newItem.leadTimeDays) || 0
    const eta = newItem.eta || ''
    const releaseDate = eta && days > 0 ? addDaysToYmd(eta, -days) : ''
    const base = {
      name: newItem.name.trim(),
      version: newItem.version || '閫氱敤',
      supplier: newItem.supplier || '',
      unit: newItem.unit || '濂?,
      riskLevel: newItem.riskLevel || '鏃?,
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
      version: '閫氱敤',
      phase: filterPhase,
      supplier: '',
      unit: '濂?,
      riskLevel: '鏃?,
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
      {/* 椤圭洰鍒楄〃椤?*/}
      {view === 'list' && (
        <>
          <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-800">TWS 璇曚骇闀垮懆鏈熺墿鏂欒拷韪潰鏉?/h1>
            <p className="text-sm text-slate-500 mt-0.5">閫夋嫨椤圭洰鎴栨柊寤洪」鐩?/p>
          </header>
          <main className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={handleNewProject}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                鏂板缓椤圭洰
              </button>
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                瀵煎嚭/澶囦唤
              </button>
              <button
                type="button"
                onClick={handleRestoreFromBackup}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                浠庡浠芥仮澶?
              </button>
            </div>
            {projects.length === 0 ? (
              <p className="text-slate-500">鏆傛棤宸蹭繚瀛樼殑椤圭洰锛岀偣鍑汇€屾柊寤洪」鐩€嶅紑濮?/p>
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
                        <p className="font-medium text-slate-800 truncate">{p.name || p.projectName || '鏈懡鍚嶉」鐩?}</p>
                        <p className="text-xs text-slate-500">
                          淇濆瓨浜?{p.savedAt ? new Date(p.savedAt).toLocaleString('zh-CN') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenProject(p)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        鎵撳紑
                      </button>
                      <button
                        onClick={() => handleCopyProject(p)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        澶嶅埗
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        鍒犻櫎
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </>
      )}

      {/* 缂栬緫椤碉細椤圭洰鍚嶇О + 淇濆瓨 + 杩斿洖 */}
      {view === 'editor' && (
        <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-6 py-4 sticky top-0 z-50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {projectProductImage && (
              <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                <img src={projectProductImage} alt="浜у搧鍥? className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="椤圭洰鍚嶇О"
                className="rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold text-slate-800 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                <span>涓婁紶浜у搧鍥?/span>
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
                <button type="button" onClick={() => setProjectProductImage(null)} className="text-slate-400 hover:text-red-600 text-sm">娓呴櫎鍥剧墖</button>
              )}
            </div>
            <input
              type="text"
              value={mdrNumber}
              onChange={(e) => setMdrNumber(e.target.value)}
              placeholder="MDR鍙?
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              <Save className="w-4 h-4" />
              淇濆瓨
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              杩斿洖椤圭洰鍒楄〃
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowWorkbook(false); setShowProductSpec(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <Box className="w-4 h-4 text-indigo-500" />
              浜у搧瑙勬牸
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowWorkbook(false); setShowProductSpec(false); setShowDistributionList(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <ClipboardList className="w-4 h-4 text-emerald-500" />
              鏍锋満鍒嗗彂鐧昏娓呭崟
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectMembers(false); setShowWorkbook(false); setShowProductSpec(false); setShowProjectPlan(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              椤圭洰璁″垝
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowWorkbook(false); setShowProductSpec(false); setShowProjectMembers(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <Users className="w-4 h-4 text-violet-500" />
              椤圭洰鎴愬憳
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(true); setShowWorkbook(false) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <Layers className="w-4 h-4 text-sky-500" />
              鎶€鏈偍澶?
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(false); setShowWorkbook(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              椤圭洰闂鐐?
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(false); setShowWorkbook(false); setShowTrialIssues(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              璇曚骇闂鐐?
            </button>
            <button
              onClick={() => { setModalOpen(false); setShowDistributionList(false); setShowProjectPlan(false); setShowProjectMembers(false); setShowProductSpec(false); setShowTechReserve(false); setShowWorkbook(false); setShowTrialIssues(false); setShowFileLibrary(true) }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
            >
              <FolderOpen className="w-4 h-4 text-cyan-500" />
              鏂囦欢璧勬枡
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500/80 mt-3 font-medium tracking-wide">NPI 璇曚骇闃舵鏍稿績鐗╂枡榻愬杩涘害</p>
      </header>

      {showProductSpec ? (
        /* 浜у搧瑙勬牸椤甸潰 - 涓庡閮ㄤ竴鑷寸殑娴呰壊 UI锛岃〃鍗曞彲閫夋嫨/杈撳叆 */
        <main className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProductSpec(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-lg font-semibold text-slate-800">浜у搧瑙勬牸</h2>
            </div>
            <div className="flex items-center gap-3">
              {productSpecSaveHint && (
                <span className="text-sm text-emerald-600">宸蹭繚瀛?/span>
              )}
              <button
                type="button"
                onClick={() => { handleSave(); setProductSpecSaveHint(true); setTimeout(() => setProductSpecSaveHint(false), 2000) }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                淇濆瓨鍒板綋鍓嶉」鐩?
              </button>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-6">濉啓鑰虫満浜у搧瑙勬牸锛屼究浜庨」鐩榻愪笌璇勫銆備互涓嬮」鍧囧彲閫夋嫨鎴栬緭鍏ワ紝淇濆瓨鍚庡啓鍏ュ綋鍓嶉」鐩€?/p>

          {/* 1. 鐗堟湰鏋舵瀯 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">鐗堟湰鏋舵瀯璇存槑 (Version Architecture)</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鐗堟湰绛栫暐</label>
                <select
                  value={productSpec.versionStrategy}
                  onChange={(e) => setProductSpec((s) => ({ ...s, versionStrategy: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {VERSION_STRATEGIES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">涓嶅彲鎷嗙増閫氳繃鐢垫睜鏀灦涓庡彲鎷嗙増澹板瀵归綈锛岃厰浣撳绉笌棰戝搷涓€鑷淬€?/p>
              </div>
              {productSpec.versionStrategy === '鍙岀増鏈彲閫? && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">涓ょ増鏈樊寮傜偣淇℃伅</label>
                  <textarea
                    value={productSpec.versionDifferences || ''}
                    onChange={(e) => setProductSpec((s) => ({ ...s, versionDifferences: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
                    placeholder="璇峰～鍐欐爣鍑嗙増涓庡彲鎸佺画鐗堢殑涓昏宸紓锛屼緥濡傦細鏍囧噯鐗堢數姹犱笉鍙媶銆佸唴缃數姹犳敮鏋讹紱鍙寔缁増鐢垫睜鍙媶鎹€佺幆淇濆悎瑙勶紱浠ュ強缁撴瀯銆佹爣璇嗐€佸寘瑁呯瓑宸紓鈥?
                  />
                  <p className="text-xs text-slate-500 mt-1">閫夊弻鐗堟湰鏃跺繀濉紝渚夸簬椤圭洰涓庡鎴峰榻愭爣鍑嗙増銆佸彲鎸佺画鐗堢殑鍖哄埆銆?/p>
                </div>
              )}
            </div>
          </section>

          {/* 2. 浜や簰涓庢劅搴?*/}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Hand className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">浜や簰涓庢劅搴旂郴缁?(Interaction & Sensing)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">瑙︽帶鏂瑰紡</label>
                <select
                  value={productSpec.touchControl}
                  onChange={(e) => setProductSpec((s) => ({ ...s, touchControl: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {TOUCH_CONTROLS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">寮€鐩栧嵆杩烇紙闇嶅皵浼犳劅鍣級</label>
                <select
                  value={productSpec.openToConnect}
                  onChange={(e) => setProductSpec((s) => ({ ...s, openToConnect: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {YES_NO.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鍏ヨ€虫娴?(Wear Detection)</label>
                <select
                  value={productSpec.wearDetection}
                  onChange={(e) => setProductSpec((s) => ({ ...s, wearDetection: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {WEAR_DETECTIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 3. 闊抽涓庨€氳瘽 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">闊抽涓庨€氳瘽鎬ц兘 (Audio & Call Quality)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鍙戝０鍗曞厓</label>
                <select
                  value={productSpec.driverType}
                  onChange={(e) => setProductSpec((s) => ({ ...s, driverType: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {DRIVER_TYPES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鎶楅鍣紭鍖栵紙0掳 杩庨锛?/label>
                <select
                  value={productSpec.windNoiseOptimized}
                  onChange={(e) => setProductSpec((s) => ({ ...s, windNoiseOptimized: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {YES_NO.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">闊抽缂栫爜</label>
                <select
                  value={productSpec.audioCodec}
                  onChange={(e) => setProductSpec((s) => ({ ...s, audioCodec: e.target.value }))}
                  className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {AUDIO_CODECS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 4. 鐗╃悊鐗规€т笌 ID 瑙勬牸 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">鐗╃悊鐗规€т笌缁嗚妭 (Mechanical & ID Specs)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">闃叉按绛夌骇</label>
                <select
                  value={productSpec.waterproof}
                  onChange={(e) => setProductSpec((s) => ({ ...s, waterproof: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {WATERPROOF_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鎸傜怀瀛旓紙鍝堟浖 ID锛?/label>
                <select
                  value={productSpec.lanyardHole}
                  onChange={(e) => setProductSpec((s) => ({ ...s, lanyardHole: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {YES_NO.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">淇濇姢濉炵洿寰?(mm)</label>
                <input
                  type="text"
                  value={productSpec.plugDiameter}
                  onChange={(e) => setProductSpec((s) => ({ ...s, plugDiameter: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?3.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">L/R 鏍囪瘑瀛楅珮 (mm)</label>
                <input
                  type="text"
                  value={productSpec.lrMarkHeight}
                  onChange={(e) => setProductSpec((s) => ({ ...s, lrMarkHeight: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?1.65"
                />
              </div>
            </div>
          </section>

          {/* 鍩虹鍙傛暟锛堜骇鍝佺被鍨嬨€佽姱鐗囥€佺數姹犮€佽摑鐗欍€佺画鑸瓑锛?*/}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">鍩虹鍙傛暟</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">浜у搧绫诲瀷</label>
                <select
                  value={productSpec.productType}
                  onChange={(e) => setProductSpec((s) => ({ ...s, productType: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鑺墖鍨嬪彿</label>
                <input
                  type="text"
                  value={productSpec.chipModel}
                  onChange={(e) => setProductSpec((s) => ({ ...s, chipModel: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?QCC3086銆丅ES2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鑰虫満鐢垫睜瀹归噺</label>
                <input
                  type="text"
                  value={productSpec.earbudBattery}
                  onChange={(e) => setProductSpec((s) => ({ ...s, earbudBattery: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?30mAh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鍏呯數鐩掔數姹犲閲?/label>
                <input
                  type="text"
                  value={productSpec.caseBattery}
                  onChange={(e) => setProductSpec((s) => ({ ...s, caseBattery: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?400mAh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">钃濈墮鐗堟湰</label>
                <select
                  value={productSpec.bluetoothVersion}
                  onChange={(e) => setProductSpec((s) => ({ ...s, bluetoothVersion: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">璇烽€夋嫨</option>
                  {BLUETOOTH_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鍗曟缁埅锛堣€虫満锛?/label>
                <input
                  type="text"
                  value={productSpec.playbackTime}
                  onChange={(e) => setProductSpec((s) => ({ ...s, playbackTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?绾?灏忔椂"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">鍏呯數鐩掑彲鍏呯數娆℃暟</label>
                <input
                  type="text"
                  value={productSpec.caseCharges}
                  onChange={(e) => setProductSpec((s) => ({ ...s, caseCharges: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="濡?绾?娆?
                />
              </div>
            </div>
          </section>

          {/* 澶囨敞 */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">椤圭洰澶囨敞</h3>
              <p className="text-xs text-slate-500 mt-0.5">鍙ˉ鍏呬笌褰撳墠椤圭洰鐩稿叧鐨勮鏍艰鏄?/p>
            </div>
            <div className="p-4">
              <textarea
                value={productSpec.remark}
                onChange={(e) => setProductSpec((s) => ({ ...s, remark: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                placeholder="鍏朵粬瑙勬牸鎴栭」鐩浉鍏宠鏄庘€?
              />
            </div>
          </section>
        </main>
      ) : showDistributionList ? (
        /* 鏍锋満鍒嗗彂鐧昏娓呭崟椤甸潰 */
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDistributionList(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-lg font-semibold text-slate-800">鏍锋満鍒嗗彂鐧昏娓呭崟</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">鏍峰搧闃舵锛?/span>
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
                淇濆瓨
              </button>
              <button
                onClick={exportDistributionExcel}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                瀵煎嚭 Excel
              </button>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                瀵煎叆 Excel
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importDistributionExcel} />
              </label>
              <button
                onClick={addDistributionRow}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                澧炲姞琛?
              </button>
            </div>
          </div>
          {distributionSaveHint && (
            <p className="text-sm text-emerald-600 mb-4">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
          )}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="text-left py-3 px-3 font-medium">鑰虫満(濂?</th>
                    <th className="text-left py-3 px-3 font-medium">鍏呯數鐩?/th>
                    <th className="text-left py-3 px-3 font-medium">PCBA</th>
                    <th className="text-left py-3 px-3 font-medium">鑰虫満缁撴瀯鎵嬫澘</th>
                    <th className="text-left py-3 px-3 font-medium">棰滆壊</th>
                    <th className="text-left py-3 px-3 font-medium">鍏徃</th>
                    <th className="text-left py-3 px-3 font-medium">棰嗙敤浜?/th>
                    <th className="text-left py-3 px-3 font-medium">璐熻矗浜?/th>
                    <th className="text-left py-3 px-3 font-medium">棰嗙敤鏃堕棿</th>
                    <th className="text-left py-3 px-3 font-medium">澶囨敞</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributionRecords.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input type="text" value={row.earphoneSet || ''} onChange={(e) => updateDistributionRecord(row.id, 'earphoneSet', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" placeholder="濂? />
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
                        <input type="text" value={row.color || ''} onChange={(e) => updateDistributionRecord(row.id, 'color', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" placeholder="棰滆壊" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.company || ''} onChange={(e) => updateDistributionRecord(row.id, 'company', e.target.value)} className="w-28 rounded border border-slate-300 px-2 py-1" placeholder="鍏徃" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.recipient || ''} onChange={(e) => updateDistributionRecord(row.id, 'recipient', e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1" placeholder="棰嗙敤浜? />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.personInCharge || ''} onChange={(e) => updateDistributionRecord(row.id, 'personInCharge', e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1" placeholder="璐熻矗浜? />
                      </td>
                      <td className="py-2 px-3">
                        <input type="date" value={row.receiptTime || ''} onChange={(e) => updateDistributionRecord(row.id, 'receiptTime', e.target.value)} className="w-32 rounded border border-slate-300 px-2 py-1" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={row.remark || ''} onChange={(e) => updateDistributionRecord(row.id, 'remark', e.target.value)} className="w-32 rounded border border-slate-300 px-2 py-1" placeholder="澶囨敞" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredDistributionRecords.length === 0 && (
              <div className="py-12 text-center text-slate-500">褰撳墠闃舵鏆傛棤鐧昏锛岀偣鍑汇€屽鍔犺銆嶆坊鍔?/div>
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
        /* 椤圭洰鎴愬憳椤甸潰 */
        <main className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProjectMembers(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-lg font-semibold text-slate-800">椤圭洰鎴愬憳</h2>
            </div>
            <button
              onClick={() => { handleSave(); setProjectMembersSaveHint(true); setTimeout(() => setProjectMembersSaveHint(false), 2000) }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              <Save className="w-4 h-4" />
              淇濆瓨
            </button>
            <button
              onClick={exportMembersExcel}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              瀵煎嚭 Excel
            </button>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              瀵煎叆 Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importMembersExcel} />
            </label>
          </div>
          {projectMembersSaveHint && (
            <p className="text-sm text-emerald-600 mb-4">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
          )}

          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700">瀹㈡埛椤圭洰鍥㈤槦鎴愬憳</h3>
              <button
                onClick={addCustomerMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" /> 澧炲姞琛?
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-600 text-white">
                      <th className="text-left py-2.5 px-3 font-medium">鑱屼綅</th>
                      <th className="text-left py-2.5 px-3 font-medium">鍚嶇О</th>
                      <th className="text-left py-2.5 px-3 font-medium">閭欢</th>
                      <th className="text-left py-2.5 px-3 font-medium">鐢佃瘽</th>
                      <th className="text-left py-2.5 px-3 font-medium">澶囨敞</th>
                      <th className="text-left py-2.5 px-3 font-medium w-20">鎿嶄綔</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerTeamMembers.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3"><input type="text" value={m.role || ''} onChange={(e) => updateCustomerMember(m.id, 'role', e.target.value)} className="w-full min-w-[100px] rounded border border-slate-300 px-2 py-1" placeholder="鑱屼綅" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.name || ''} onChange={(e) => updateCustomerMember(m.id, 'name', e.target.value)} className="w-full min-w-[80px] rounded border border-slate-300 px-2 py-1" placeholder="鍚嶇О" /></td>
                        <td className="py-2 px-3"><input type="email" value={m.email || ''} onChange={(e) => updateCustomerMember(m.id, 'email', e.target.value)} className="w-full min-w-[160px] rounded border border-slate-300 px-2 py-1" placeholder="閭欢" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.phone || ''} onChange={(e) => updateCustomerMember(m.id, 'phone', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="鐢佃瘽" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.remark || ''} onChange={(e) => updateCustomerMember(m.id, 'remark', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="澶囨敞" /></td>
                        <td className="py-2 px-3"><button type="button" onClick={() => deleteCustomerMember(m.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title="鍒犻櫎"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {customerTeamMembers.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">鏆傛棤鎴愬憳锛岀偣鍑汇€屽鍔犺銆嶆坊鍔?/div>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-700">鍐呴儴椤圭洰鎴愬憳</h3>
              <button
                onClick={addInternalMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" /> 澧炲姞琛?
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-600 text-white">
                      <th className="text-left py-2.5 px-3 font-medium">鑱屼綅</th>
                      <th className="text-left py-2.5 px-3 font-medium">鍚嶇О</th>
                      <th className="text-left py-2.5 px-3 font-medium">閭欢</th>
                      <th className="text-left py-2.5 px-3 font-medium">鐢佃瘽</th>
                      <th className="text-left py-2.5 px-3 font-medium">澶囨敞</th>
                      <th className="text-left py-2.5 px-3 font-medium w-20">鎿嶄綔</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internalMembers.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3"><input type="text" value={m.role || ''} onChange={(e) => updateInternalMember(m.id, 'role', e.target.value)} className="w-full min-w-[100px] rounded border border-slate-300 px-2 py-1" placeholder="鑱屼綅" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.name || ''} onChange={(e) => updateInternalMember(m.id, 'name', e.target.value)} className="w-full min-w-[80px] rounded border border-slate-300 px-2 py-1" placeholder="鍚嶇О" /></td>
                        <td className="py-2 px-3"><input type="email" value={m.email || ''} onChange={(e) => updateInternalMember(m.id, 'email', e.target.value)} className="w-full min-w-[160px] rounded border border-slate-300 px-2 py-1" placeholder="閭欢" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.phone || ''} onChange={(e) => updateInternalMember(m.id, 'phone', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="鐢佃瘽" /></td>
                        <td className="py-2 px-3"><input type="text" value={m.remark || ''} onChange={(e) => updateInternalMember(m.id, 'remark', e.target.value)} className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1" placeholder="澶囨敞" /></td>
                        <td className="py-2 px-3"><button type="button" onClick={() => deleteInternalMember(m.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title="鍒犻櫎"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {internalMembers.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">鏆傛棤鎴愬憳锛岀偣鍑汇€屽鍔犺銆嶆坊鍔?/div>}
            </div>
          </section>
        </main>
      ) : showTechReserve ? (
        /* 鎶€鏈偍澶囬〉闈?*/
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTechReserve(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-base font-semibold text-slate-800">鎶€鏈偍澶?/h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setTechReserveSaveHint(true); setTimeout(() => setTechReserveSaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                淇濆瓨
              </button>
            </div>
          </div>
          {techReserveSaveHint && (
            <p className="text-sm text-emerald-600 mb-3">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
          )}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* 宸︿晶锛氭ā鍧椾笌鏉＄洰鍒楄〃 */}
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
                    placeholder="鎼滅储鍚嶈瘝 / 鏍囩"
                    className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTechEntry(techActiveModule)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    鏂板
                  </button>
                </div>
              </div>
              <div className="p-2 max-h-[480px] overflow-y-auto">
                {(() => {
                  const q = techSearch.trim().toLowerCase()
                  // 褰撴湁鎼滅储鍏抽敭瀛楁椂锛屽湪鎵€鏈夋ā鍧椾腑鎼滅储锛涘惁鍒欏彧鐪嬪綋鍓嶆ā鍧?
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
                    return <p className="text-xs text-slate-400 px-2 py-4">鏆傛棤鍖归厤璁板綍锛屽彲鐐瑰嚮鍙充笂瑙掋€屾柊澧炪€嶆坊鍔犮€?/p>
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
                        <span className="font-semibold truncate">{e.term || '鏈懡鍚嶅悕璇?}</span>
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

            {/* 鍙充晶锛氳鎯呯紪杈?*/}
            <section className="flex-1 p-4 space-y-4">
              {(() => {
                const list = techReserve[techActiveModule] || []
                if (list.length === 0) {
                  return <p className="text-sm text-slate-400">褰撳墠妯″潡鏆傛棤鎶€鏈偍澶囷紝鐐瑰嚮宸︿晶銆屾柊澧炪€嶅紑濮嬭褰曘€?/p>
                }
                const active = list.find((e) => e.id === techActiveId) || list[0]
                if (!active) {
                  return <p className="text-sm text-slate-400">璇烽€夋嫨宸︿晶鐨勪竴鏉¤褰曡繘琛岀紪杈戙€?/p>
                }
                const onFieldChange = (field, value) => updateTechEntry(techActiveModule, active.id, field, value)
                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-800">鍚嶈瘝 / 鎶€鏈偣</h3>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {techActiveModule}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={active.term || ''}
                          onChange={(e) => onFieldChange('term', e.target.value)}
                          placeholder="濡傦細ANC 鍓嶉/鍙嶉銆佸爢鍙犲叕宸€丷F 浜掕皟绛?
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTechEntry(techActiveModule, active.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        鍒犻櫎
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">涓€鍙ヨ瘽瑙ｉ噴</label>
                        <textarea
                          value={active.summary || ''}
                          onChange={(e) => onFieldChange('summary', e.target.value)}
                          placeholder="绠€瑕佽鏄庤鎶€鏈偣鐨勫畾涔夋垨浣滅敤锛屾柟渚垮揩閫熸壂涓€鐪肩悊瑙ｃ€?
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs min-h-[72px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">閫傜敤闃舵 / 妯″潡鏍囩</label>
                        <input
                          type="text"
                          value={active.phaseScope || ''}
                          onChange={(e) => onFieldChange('phaseScope', e.target.value)}
                          placeholder="濡傦細EV/DV1銆佹暣鏈?RF 楠岃瘉銆佸０瀛﹁皟鏍″墠鏈熺瓑"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="block text-xs font-medium text-slate-600 mt-2 mb-1">鏍囩</label>
                        <input
                          type="text"
                          value={active.tags || ''}
                          onChange={(e) => onFieldChange('tags', e.target.value)}
                          placeholder="鐢ㄩ€楀彿鍒嗛殧锛屽锛氬弬鏁? 椋庨櫓鐐? 楠岃瘉鏂规硶"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">璇︾粏璇存槑</label>
                      <RichTextEditor
                        value={active.details || ''}
                        onChange={(html) => onFieldChange('details', html)}
                        placeholder="鎻忚堪鎶€鏈師鐞嗐€佸叧閿弬鏁般€佷笌浜у搧鐨勫叧绯荤瓑銆傚彲鐢ㄥ皬娈佃惤鎴栧垪鐐癸紝鍙矘璐村浘鐗囥€?
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">缁忛獙瑕佺偣 / 甯歌闂</label>
                      <textarea
                        value={active.notes || ''}
                        onChange={(e) => onFieldChange('notes', e.target.value)}
                        placeholder="璁板綍浠ュ線椤圭洰韪╄繃鐨勫潙銆丆hecklist銆佹敞鎰忎簨椤广€佸吀鍨嬮棶棰樻渚嬬瓑銆?
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>璐熻矗浜?鏉ユ簮锛?/span>
                        <input
                          type="text"
                          value={active.owner || ''}
                          onChange={(e) => onFieldChange('owner', e.target.value)}
                          placeholder="濡傦細澹板涓撳A / 鏌愯瘎瀹′細璁?
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      {active.updatedAt && (
                        <span>鏈€杩戞洿鏂帮細{new Date(active.updatedAt).toLocaleString('zh-CN')}</span>
                      )}
                    </div>
                  </>
                )
              })()}
            </section>
          </div>
        </main>
      ) : showWorkbook ? (
        /* 椤圭洰闂鐐归〉闈?*/
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWorkbook(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-base font-semibold text-slate-800">椤圭洰闂鐐?/h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setWorkbookSaveHint(true); setTimeout(() => setWorkbookSaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                淇濆瓨
              </button>
              <button
                onClick={exportWorkbookToExcel}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-amber-700"
              >
                <BookOpen className="w-4 h-4" />
                瀵煎嚭 Excel
              </button>
            </div>
          </div>
          {workbookSaveHint && (
            <p className="text-sm text-emerald-600 mb-3">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
          )}
          <p className="text-slate-600 text-sm mb-4">鎸夊垎绫昏褰曢」鐩腑鍙戠幇鐨勯棶棰橈紝Actions or Details 鍙畾鏈熻緭鍏ユ洿鏂般€?/p>
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
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> 娣诲姞闂鐐?
                  </button>
                </div>
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="pb-2 pr-2 font-medium w-8">#</th>
                        <th className="pb-2 font-medium min-w-[180px]">Actions or Details</th>
                        <th className="pb-2 font-medium w-24">璐ｄ换浜?/th>
                        <th className="pb-2 font-medium w-32">闂鎻愬嚭鏃堕棿</th>
                        <th className="pb-2 font-medium w-20">椋庨櫓绋嬪害</th>
                        <th className="pb-2 pl-2 font-medium w-16">鎿嶄綔</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(workbookEntries[category] || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">鏆傛棤璁板綍锛岀偣鍑汇€屾坊鍔犻棶棰樼偣銆嶆坊鍔?/td>
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
                                  {(entry.content || '').trim() || <span className="text-slate-400">杈撳叆闂鎻忚堪鎴栬窡杩涙帾鏂解€?鐐瑰嚮鏀惧ぇ缂栬緫</span>}
                                </div>
                                <button type="button" onClick={() => { setWorkbookDetailModal({ category, entryId: entry.id }); setWorkbookDetailContent(entry.content || '') }} className="shrink-0 p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50" title="鏀惧ぇ棰勮/缂栬緫"><Maximize2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                            <td className="py-1.5 align-top">
                              <input
                                type="text"
                                value={entry.responsiblePerson || ''}
                                onChange={(e) => updateWorkbookEntry(category, entry.id, 'responsiblePerson', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                placeholder="璐ｄ换浜?
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
                                value={entry.riskLevel || '鏃?}
                                onChange={(e) => updateWorkbookEntry(category, entry.id, 'riskLevel', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                              >
                                {RISK_LEVELS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-1.5 pl-2 align-top">
                              <button type="button" onClick={() => deleteWorkbookEntry(category, entry.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title="鍒犻櫎"><Trash2 className="w-4 h-4" /></button>
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
        /* 璇曚骇闂鐐归〉闈?*/
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTrialIssues(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-base font-semibold text-slate-800">璇曚骇闂鐐?/h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setTrialIssuesSaveHint(true); setTimeout(() => setTrialIssuesSaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                淇濆瓨
              </button>
            </div>
          </div>
          {trialIssuesSaveHint && (
            <p className="text-sm text-emerald-600 mb-3">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
          )}
          <p className="text-slate-600 text-sm mb-4">鎸?DV1/DV2/PV 闃舵璁板綍璇曚骇涓彂鐜扮殑闂锛岃窡韪鐞嗚繘搴︺€?/p>
          
          {/* 闃舵鍒囨崲 */}
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
          
          {/* 娣诲姞鎸夐挳 */}
          <div className="mb-4">
            <button
              onClick={() => setTrialIssueModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"
            >
              <Plus className="w-4 h-4" />
              娣诲姞闂鐐?
            </button>
          </div>
          
          {/* 闂鐐瑰垪琛?*/}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2 pr-2 font-medium w-8">#</th>
                    <th className="pb-2 font-medium min-w-[200px]">闂鎻忚堪</th>
                    <th className="pb-2 font-medium w-24">璐熻矗浜?/th>
                    <th className="pb-2 font-medium w-24">绫诲瀷</th>
                    <th className="pb-2 font-medium w-32">鍘熷洜鍒嗘瀽</th>
                    <th className="pb-2 font-medium w-20">浼樺厛绾?/th>
                    <th className="pb-2 font-medium w-20">鐘舵€?/th>
                    <th className="pb-2 font-medium w-32">鏀跺熬鏃堕棿</th>
                    <th className="pb-2 pl-2 font-medium w-16">鎿嶄綔</th>
                  </tr>
                </thead>
                <tbody>
                  {(trialIssues[trialIssuesPhase] || []).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-400 text-xs">鏆傛棤璁板綍锛岀偣鍑汇€屾坊鍔犻棶棰樼偣銆嶆坊鍔?/td>
                    </tr>
                  ) : (
                    (trialIssues[trialIssuesPhase] || []).map((issue, idx) => (
                      <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 pr-2 text-slate-400 align-top">{idx + 1}</td>
                        <td className="py-2 align-top">
                          <div className="text-slate-800 text-xs">{issue.description || '-'}</div>
                        </td>
                        <td className="py-2 align-top">
                          <input
                            type="text"
                            value={issue.owner || ''}
                            onChange={(e) => updateTrialIssue(issue.id, 'owner', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            placeholder="璐熻矗浜?
                          />
                        </td>
                        <td className="py-2 align-top">
                          <input
                            type="text"
                            value={issue.project || ''}
                            onChange={(e) => updateTrialIssue(issue.id, 'project', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            placeholder="椤圭洰"
                          />
                        </td>
                        <td className="py-2 align-top">
                          <div className="text-slate-800 text-xs">{issue.cause || '-'}</div>
                        </td>
                        <td className="py-2 align-top">
                          <select
                            value={issue.priority || '涓?}
                            onChange={(e) => updateTrialIssue(issue.id, 'priority', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          >
                            <option value="楂?>楂?/option>
                            <option value="涓?>涓?/option>
                            <option value="浣?>浣?/option>
                          </select>
                        </td>
                        <td className="py-2 align-top">
                          <select
                            value={issue.status || '寰呭鐞?}
                            onChange={(e) => updateTrialIssue(issue.id, 'status', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          >
                            <option value="寰呭鐞?>寰呭鐞?/option>
                            <option value="澶勭悊涓?>澶勭悊涓?/option>
                            <option value="宸茶В鍐?>宸茶В鍐?/option>
                            <option value="鍏抽棴">鍏抽棴</option>
                          </select>
                        </td>
                        <td className="py-2 align-top">
                          <input
                            type="date"
                            value={issue.closeTime || ''}
                            onChange={(e) => updateTrialIssue(issue.id, 'closeTime', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 pl-2 align-top">
                          <button
                            type="button"
                            onClick={() => deleteTrialIssue(issue.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="鍒犻櫎"
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
          
          {/* 娣诲姞闂鐐瑰脊绐?*/}
          {trialIssueModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setTrialIssueModal(false)}>
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">娣诲姞闂鐐?- {trialIssuesPhase}</h2>
                  <button onClick={() => setTrialIssueModal(false)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">闂鎻忚堪</label>
                    <textarea
                      value={trialIssueForm.description}
                      onChange={(e) => setTrialIssueForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="鎻忚堪闂..."
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">璐熻矗浜?/label>
                      <input
                        type="text"
                        value={trialIssueForm.owner}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, owner: e.target.value }))}
                        placeholder="璐熻矗浜?
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">绫诲瀷</label>
                      <input
                        type="text"
                        value={trialIssueForm.project}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, project: e.target.value }))}
                        placeholder="绫诲瀷"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">鍘熷洜鍒嗘瀽</label>
                    <textarea
                      value={trialIssueForm.cause}
                      onChange={(e) => setTrialIssueForm((p) => ({ ...p, cause: e.target.value }))}
                      placeholder="鍒嗘瀽鍘熷洜..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">浼樺厛绾?/label>
                      <select
                        value={trialIssueForm.priority}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, priority: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="楂?>楂?/option>
                        <option value="涓?>涓?/option>
                        <option value="浣?>浣?/option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">鐘舵€?/label>
                      <select
                        value={trialIssueForm.status}
                        onChange={(e) => setTrialIssueForm((p) => ({ ...p, status: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="寰呭鐞?>寰呭鐞?/option>
                        <option value="澶勭悊涓?>澶勭悊涓?/option>
                        <option value="宸茶В鍐?>宸茶В鍐?/option>
                        <option value="鍏抽棴">鍏抽棴</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">鏀跺熬鏃堕棿</label>
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
                    onClick={() => setTrialIssueModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    鍙栨秷
                  </button>
                  <button
                    onClick={addTrialIssue}
                    className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    娣诲姞
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : showFileLibrary ? (
        /* 鏂囦欢璧勬枡椤甸潰 */
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileLibrary(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                杩斿洖鐗╂枡杩借釜
              </button>
              <h2 className="text-base font-semibold text-slate-800">鏂囦欢璧勬枡</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleSave(); setFileLibrarySaveHint(true); setTimeout(() => setFileLibrarySaveHint(false), 2000) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                淇濆瓨
              </button>
            </div>
          </div>
          {fileLibrarySaveHint && (
            <p className="text-sm text-emerald-600 mb-3">宸蹭繚瀛橈紝鏁版嵁宸叉洿鏂?/p>
          )}
          <p className="text-slate-600 text-sm mb-4">涓婁紶椤圭洰鐩稿叧鏂囦欢锛屾敮鎸佽鏍间功銆佸浘绾搞€佹姤鍛婄瓑绫诲瀷銆?/p>
          
          {/* 涓婁紶鍖哄煙 */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-4 hover:border-cyan-400 hover:bg-cyan-50/50 transition-colors cursor-pointer"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">鎷栨嫿鏂囦欢鍒版澶勪笂浼狅紝鎴栫偣鍑婚€夋嫨鏂囦欢</p>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {/* 绛涢€?*/}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">鍏ㄩ儴绫诲瀷</option>
              <option value="瑙勬牸涔?>瑙勬牸涔?/option>
              <option value="鍥剧焊">鍥剧焊</option>
              <option value="鎶ュ憡">鎶ュ憡</option>
              <option value="浼氳璁板綍">浼氳璁板綍</option>
              <option value="鍏朵粬">鍏朵粬</option>
            </select>
            <input
              type="text"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="鎼滅储鏂囦欢鍚?.."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm flex-1 max-w-xs"
            />
          </div>
          
          {/* 鏂囦欢鍒楄〃 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2 pr-2 font-medium">鏂囦欢鍚?/th>
                    <th className="pb-2 font-medium w-24">绫诲瀷</th>
                    <th className="pb-2 font-medium w-24">鐗堟湰</th>
                    <th className="pb-2 font-medium w-32">璇存槑</th>
                    <th className="pb-2 font-medium w-32">涓婁紶鏃堕棿</th>
                    <th className="pb-2 pl-2 font-medium w-24">鎿嶄綔</th>
                  </tr>
                </thead>
                <tbody>
                  {fileLibrary.filter((f) => {
                    const matchType = !fileFilter || f.type === fileFilter
                    const matchSearch = !fileSearch || f.name.toLowerCase().includes(fileSearch.toLowerCase())
                    return matchType && matchSearch
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">鏆傛棤鏂囦欢锛屾嫋鎷芥垨鐐瑰嚮涓婁紶</td>
                    </tr>
                  ) : (
                    fileLibrary.filter((f) => {
                      const matchType = !fileFilter || f.type === fileFilter
                      const matchSearch = !fileSearch || f.name.toLowerCase().includes(fileSearch.toLowerCase())
                      return matchType && matchSearch
                    }).map((file) => (
                      <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-600" />
                            <span className="text-slate-800 text-xs">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span className="text-xs text-slate-600">{file.type}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-xs text-slate-600">{file.version || 'V1.0'}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-xs text-slate-600">{file.description || '-'}</span>
                        </td>
                        <td className="py-2">
                          <span className="text-xs text-slate-500">{file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : '-'}</span>
                        </td>
                        <td className="py-2 pl-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => downloadFile(file)}
                              className="p-1 rounded text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
                              title="涓嬭浇"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteFile(file.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="鍒犻櫎"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 鏂囦欢涓婁紶寮圭獥 */}
          {fileUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setFileUploadModal(false)}>
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">涓婁紶鏂囦欢</h2>
                  <button onClick={() => setFileUploadModal(false)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">寰呬笂浼犳枃浠?/label>
                    <div className="space-y-1">
                      {pendingFiles.map((f, i) => (
                        <div key={i} className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded">{f.name}</div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">鏂囦欢绫诲瀷</label>
                      <select
                        value={fileForm.type}
                        onChange={(e) => setFileForm((p) => ({ ...p, type: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="瑙勬牸涔?>瑙勬牸涔?/option>
                        <option value="鍥剧焊">鍥剧焊</option>
                        <option value="鎶ュ憡">鎶ュ憡</option>
                        <option value="浼氳璁板綍">浼氳璁板綍</option>
                        <option value="鍏朵粬">鍏朵粬</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">鐗堟湰鍙?/label>
                      <input
                        type="text"
                        value={fileForm.version}
                        onChange={(e) => setFileForm((p) => ({ ...p, version: e.target.value }))}
                        placeholder="濡傦細V1.0"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">鏂囦欢璇存槑</label>
                    <textarea
                      value={fileForm.description}
                      onChange={(e) => setFileForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="鍙€夎鏄?.."
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setFileUploadModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    鍙栨秷
                  </button>
                  <button
                    onClick={uploadFiles}
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    涓婁紶
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* 鍏ㄥ眬姒傝鍗＄墖 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-0.5">鍏抽敭鐗╂枡椤规暟</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500 mb-0.5">璇曚骇鏃堕棿</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{trialProductionTime || '-'}</p>
                <p className="text-xs text-slate-400 mt-1">鏁存満璇曚骇鏃堕棿锛堝彲鍦ㄤ笅鏂逛慨鏀癸級</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-0.5">椋庨櫓鐗╂枡鏁?/p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats.riskCount}</p>
                <p className="text-xs text-slate-400 mt-1">鍒拌揣鐜?0% 鎴栦复杩戜氦鏈熸湭榻愬</p>
              </div>
            </div>
          </div>
        </section>

        {/* 绛涢€?+ 闃舵鍒囨崲 + 娣诲姞鎸夐挳 */}
        <section className="flex flex-wrap items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-slate-600 bg-slate-100/80 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">绛涢€?/span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all hover:border-slate-300"
            >
              <option value="鍏ㄩ儴">浣跨敤鐗堟湰锛氬叏閮?/option>
              {VERSIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-slate-300/60"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">闃舵锛?/span>
            {PHASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPhase(p)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  filterPhase === p
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-300/60"></div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">璇曚骇鏃堕棿锛?/span>
            <input
              type="date"
              value={trialProductionTime}
              onChange={(e) => setTrialProductionTime(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all hover:border-slate-300"
              title="鏁存満璇曚骇鏃堕棿"
            />
            <button
              type="button"
              onClick={() => setPhaseStartRangesExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              title={phaseStartRangesExpanded ? '鏀惰捣闃舵鏃堕棿' : '灞曞紑闃舵鏃堕棿'}
            >
              {phaseStartRangesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {phaseStartRangesExpanded ? '鏀惰捣闃舵鏃堕棿' : '灞曞紑闃舵鏃堕棿'}
            </button>
          </div>
          {phaseStartRangesExpanded && (
          <div className="flex flex-wrap items-center gap-4 w-full mt-2">
            <span className="text-sm font-medium text-slate-600">闃舵璇曚骇寮€濮嬫椂闂达紙鏃堕棿鍖洪棿锛夛細</span>
            <div className="flex flex-wrap gap-6">
              {['鍙媶', '涓嶅彲鎷?].map((type) => (
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
                        title="寮€濮嬫棩鏈?
                      />
                      <span className="text-slate-400">锝?/span>
                      <input
                        type="date"
                        value={phaseStartRanges[type][index]?.end ?? ''}
                        onChange={(e) => updatePhaseStartRange(type, index, 'end', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="缁撴潫鏃ユ湡"
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
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 text-sm font-medium hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 shadow-md shadow-blue-200 transition-all duration-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            娣诲姞鏂扮墿鏂?
          </button>
        </section>

        {/* 鐗╂枡杩借釜涓昏〃鏍硷細鐣岄潰涓庡師鏉ヤ竴鑷达紝鎸夐樁娈靛垏鎹紱EV/DV1/DV2/PV 鐗╂枡鍚嶇О涓庨『搴忎竴鑷达紝DV1 澧炲垹鐗╂枡浼氬悓姝ュ埌鍏朵粬涓夐樁娈碉紝鏁伴噺/鏃堕棿绛夊彲鍚勯樁娈靛崟鐙紪杈?*/}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 text-sm text-slate-600">
            褰撳墠闃舵锛?span className="font-semibold text-blue-600">{filterPhase}</span>
            {displayedKeyMaterialKeys.length > 0 && (
              <span className="ml-2 text-slate-500">鍏?{displayedKeyMaterialKeys.length} 椤癸紙鍥涢樁娈电墿鏂欏悕绉颁笌椤哄簭涓€鑷达紝澧炲垹鍚屾锛?/span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">鐗╂枡鍚嶇О</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">渚涘簲鍟?/th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">闇€姹傛暟閲忥紙濂楋級</th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">澶囨枡鍛ㄦ湡锛堝ぉ锛?/th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">鏀捐鏃ユ湡</th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">寮€濮嬩氦鏂欐棩鏈?/th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">榻愭枡鏃堕棿</th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 w-20 text-xs">澶囨敞</th>
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
                      className={`border-b border-slate-100 hover:opacity-95 ${etaRowBg || (risk ? 'bg-amber-50/50' : '')} ${!etaRowBg && !risk ? 'hover:bg-slate-50/50' : ''}`}
                    >
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleField('name', e.target.value)}
                          className="w-full min-w-[80px] rounded border border-slate-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                          placeholder="鐗╂枡鍚嶇О"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.supplier || ''}
                          onChange={(e) => handleField('supplier', e.target.value)}
                          className="w-full min-w-[60px] rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="渚涘簲鍟?
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
                            
                            // 杈撳叆澶囨枡鍛ㄦ湡锛岃嚜鍔ㄨ绠楁斁琛屾棩鏈燂紙涓嶅彉鍔ㄤ氦鏂欐棩鏈燂級
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
                          title="杈撳叆澶囨枡鍛ㄦ湡鑷姩璁＄畻鏀捐鏃ユ湡"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="date"
                          value={row.releaseDate ?? ''}
                          onChange={(e) => {
                            const releaseDate = e.target.value
                            const eta = row.eta
                            
                            // 杈撳叆鏀捐鏃ユ湡锛岃嚜鍔ㄨ绠楀鏂欏懆鏈燂紙涓嶅彉鍔ㄤ氦鏂欐棩鏈燂級
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
                          title="杈撳叆鏀捐鏃ユ湡鑷姩璁＄畻澶囨枡鍛ㄦ湡"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="date"
                          value={row.eta ?? ''}
                          onChange={(e) => {
                            const eta = e.target.value
                            const releaseDate = row.releaseDate
                            
                            // 杈撳叆寮€濮嬩氦鏂欐棩鏈燂紝鑷姩璁＄畻澶囨枡鍛ㄦ湡锛堜笉鍙樺姩鏀捐鏃ユ湡锛?
                            let newLeadTime = row.leadTimeDays
                            if (eta && releaseDate) {
                              const etaDate = new Date(eta)
                              const release = new Date(releaseDate)
                              newLeadTime = Math.round((etaDate - release) / 86400000)
                            }
                            // 榻愭枡鏃堕棿榛樿绛変簬寮€濮嬩氦鏂欐棩鏈?
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
                          title="杈撳叆寮€濮嬩氦鏂欐棩鏈熻嚜鍔ㄨ绠楀鏂欏懆鏈燂紝鍚屾椂璁剧疆榻愭枡鏃堕棿"
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
                          title="鐐瑰嚮鏌ョ湅/缂栬緫瀹屾暣澶囨敞"
                        >
                          {(row.remark || '').trim() || '澶囨敞'}
                        </button>
                        <span className="inline-flex items-center gap-0.5 mt-0.5">
                          <button
                            type="button"
                            onClick={() => moveMaterialKey(key, 'up')}
                            disabled={index <= 0}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="涓婄Щ"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMaterialKey(key, 'down')}
                            disabled={index >= filteredMaterialsForDisplay.length - 1}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                            title="涓嬬Щ"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMaterialByKey(key)}
                            className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="鍒犻櫎"
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
            <div className="py-12 text-center text-slate-500">鏆傛棤鍏抽敭鐗╂枡锛岃鍏堟坊鍔狅紙灏嗚嚜鍔ㄥ湪 EV/DV1/DV2/PV 鍚勫缓涓€鏉★紝鍚嶇О涓庨『搴忎竴鑷达級</div>
          )}
        </section>

        {/* 鏍锋満闇€姹傜粺璁★細鍗曢樁娈电晫闈紝DV1/DV2/PV 鍒囨崲锛涘彲鎷?涓嶅彲鎷?脳 鎶曚骇銆佸疄闄呴渶姹傘€佸鎴锋牱鏈恒€佽瘯浜ц壇鐜?*/}
        <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">鏍锋満闇€姹傜粺璁?/h2>
              <p className="text-sm text-slate-500 mt-0.5">閫夋嫨闃舵鍚庡垎鍒～鍐欒€虫満銆佸厖鐢电洅鐨勬牱鏈洪渶姹傦紱鍥哄畾瀹為檯闇€姹傛暟閲忥紝杈撳叆璇曚骇鑹巼鍚庤嚜鍔ㄨ绠椾富鏉挎姇浜ф暟閲忥紱鍙～鍐欑粨鏋勫鏂欐暟閲忋€?/p>
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
                瀵煎嚭 Excel
              </button>
              <button
                type="button"
                onClick={() => addProductColor(productDemandPhase)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                娣诲姞棰滆壊
              </button>
            </div>
          </div>
          <div className="p-4 space-y-8">
            {(() => {
              const phase = productDemandPhase
              const colors = productColorsByPhase[phase] || []
              const renderDemandTable = (title, mode, setMode, versionKeys, versionLabels, showCustomerSample = true) => {
                const colSpanPerVer = showCustomerSample ? 5 : 4
                return (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">鐗堟湰锛?/span>
                      <button
                        type="button"
                        onClick={() => setMode('鍙媶涓嶅彲鎷?)}
                        className={`rounded px-3 py-1.5 text-xs font-medium ${mode === '鍙媶涓嶅彲鎷? ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        鍙媶 / 涓嶅彲鎷?
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('閫氱敤')}
                        className={`rounded px-3 py-1.5 text-xs font-medium ${mode === '閫氱敤' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        浠呴€氱敤
                      </button>
                    </div>
                  </div>
                  <div className={mode === '閫氱敤' ? 'flex justify-center overflow-x-auto' : 'overflow-x-auto'}>
                    <table className={mode === '閫氱敤' ? 'w-max text-sm' : 'w-full text-sm'}>
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-2 px-3 font-medium text-slate-600 w-24 sticky left-0 bg-slate-50 z-10">棰滆壊</th>
                          {versionKeys.map((ver) => (
                            <Fragment key={ver}>
                              <th colSpan={colSpanPerVer} className="py-1.5 px-3 font-medium text-slate-600 border-l border-slate-200 bg-white text-center">{versionLabels[ver]}</th>
                            </Fragment>
                          ))}
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-1 px-3 w-24 sticky left-0 bg-slate-50 z-10"></th>
                          {versionKeys.map((ver) => (
                            <Fragment key={ver}>
                              <th className="py-1 px-2 text-xs font-medium text-slate-500 w-22 border-l border-slate-100 text-center">涓绘澘鎶曚骇鏁伴噺</th>
                              <th className="py-1 px-2 text-xs font-medium text-slate-500 w-22 text-center">缁撴瀯澶囨枡鏁伴噺</th>
                              <th className="py-1 px-2 text-xs font-medium text-slate-500 w-22 text-center">瀹為檯闇€姹傛暟閲?/th>
                              {showCustomerSample && <th className="py-1 px-2 text-xs font-medium text-slate-500 w-22 text-center">瀹㈡埛鏍锋満鏁伴噺</th>}
                              <th className="py-1 px-2 text-xs font-medium text-slate-500 w-20 border-l border-slate-100 text-center">璇曚骇鑹巼</th>
                            </Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {colors.map((color) => (
                          <tr key={color} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-800 sticky left-0 bg-white">
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
                                  className="w-20 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button type="button" onClick={() => removeProductColor(phase, color)} className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" title={`鍒犻櫎棰滆壊銆?{color}銆峘}><X className="w-3.5 h-3.5" /></button>
                              </span>
                            </td>
                            {versionKeys.map((ver) => {
                              const cell = (productDemands[phase]?.[ver]?.[color]) || { putInQty: 0, structurePutInQty: 0, actualDemand: 0, customerSample: 0 }
                              const putIn = Number(cell.putInQty) || 0
                              const actual = Number(cell.actualDemand) || 0
                              const yieldPct = putIn > 0 && actual > 0 ? Math.min(100, Math.round((actual / putIn) * 100)) : ''
                              return (
                                <Fragment key={ver}>
                                  <td className="py-2 px-2 border-l border-slate-100 text-center">
                                    <input type="number" min={0} value={cell.putInQty ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'putInQty', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" title="鍙敱璇曚骇鑹巼鍙嶇畻" />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <input type="number" min={0} value={cell.structurePutInQty ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'structurePutInQty', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <input type="number" min={0} value={cell.actualDemand ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'actualDemand', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                  </td>
                                  {showCustomerSample && (
                                    <td className="py-2 px-2 text-center">
                                      <input type="number" min={0} value={cell.customerSample ?? ''} onChange={(e) => updateProductDemand(phase, ver, color, 'customerSample', e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                                    </td>
                                  )}
                                  <td className="py-2 px-2 border-l border-slate-100 text-center">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={yieldPct === '' ? '' : yieldPct}
                                      onChange={(e) => updateProductDemandByYield(phase, ver, color, e.target.value)}
                                      className="w-16 rounded border border-slate-300 px-1.5 py-1 text-center text-slate-700 tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500"
                                      placeholder="%"
                                      title="杈撳叆鍚庢寜瀹為檯闇€姹傛暟閲忓弽绠椾富鏉挎姇浜ф暟閲?
                                    />
                                    {yieldPct !== '' && <span className="text-slate-500 ml-0.5">%</span>}
                                  </td>
                                </Fragment>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 border-t-2 border-slate-200 font-medium text-slate-800">
                          <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10">鍚堣</td>
                          {versionKeys.map((ver) => {
                            const putInSum = colors.reduce((s, c) => s + (Number((productDemands[phase]?.[ver]?.[c])?.putInQty) || 0), 0)
                            const structureSum = colors.reduce((s, c) => s + (Number((productDemands[phase]?.[ver]?.[c])?.structurePutInQty) || 0), 0)
                            const actualSum = colors.reduce((s, c) => s + (Number((productDemands[phase]?.[ver]?.[c])?.actualDemand) || 0), 0)
                            const customerSum = showCustomerSample ? colors.reduce((s, c) => s + (Number((productDemands[phase]?.[ver]?.[c])?.customerSample) || 0), 0) : null
                            return (
                              <Fragment key={ver}>
                                <td className="py-2 px-2 border-l border-slate-200 text-center tabular-nums">{putInSum}</td>
                                <td className="py-2 px-2 text-center tabular-nums">{structureSum}</td>
                                <td className="py-2 px-2 text-center tabular-nums">{actualSum}</td>
                                {showCustomerSample && <td className="py-2 px-2 text-center tabular-nums">{customerSum}</td>}
                                <td className="py-2 px-2 border-l border-slate-200 text-center text-slate-500">鈥?/td>
                              </Fragment>
                            )
                          })}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              const earphoneVersions = demandEarphoneMode === '閫氱敤' ? ['鑰虫満鍙媶'] : ['鑰虫満鍙媶', '鑰虫満涓嶅彲鎷?]
              const chargerVersions = demandChargerMode === '閫氱敤' ? ['鍏呯數鐩掑彲鎷?] : ['鍏呯數鐩掑彲鎷?, '鍏呯數鐩掍笉鍙媶']
              const earphoneLabels = demandEarphoneMode === '閫氱敤' ? { '鑰虫満鍙媶': '閫氱敤' } : { '鑰虫満鍙媶': '鑰虫満-鍙媶', '鑰虫満涓嶅彲鎷?: '鑰虫満-涓嶅彲鎷? }
              const chargerLabels = demandChargerMode === '閫氱敤' ? { '鍏呯數鐩掑彲鎷?: '閫氱敤' } : { '鍏呯數鐩掑彲鎷?: '鍏呯數鐩?鍙媶', '鍏呯數鐩掍笉鍙媶': '鍏呯數鐩?涓嶅彲鎷? }
              return (
                <>
                  {renderDemandTable('鑰虫満', demandEarphoneMode, setDemandEarphoneMode, earphoneVersions, earphoneLabels, true)}
                  {renderDemandTable('鍏呯數鐩?, demandChargerMode, setDemandChargerMode, chargerVersions, chargerLabels, false)}
                </>
              )
            })()}
          </div>
        </section>
      </main>
      )}
        </>
      )}

      {/* 娣诲姞鏂扮墿鏂欏脊绐?*/}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">娣诲姞鏂扮墿鏂?/h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">鐗╂枡鍚嶇О</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="濡傦細鍠囧彮 (Speaker)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">闃舵</label>
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
                  <label className="block text-sm font-medium text-slate-600 mb-1">浣跨敤鐗堟湰</label>
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
                  <label className="block text-sm font-medium text-slate-600 mb-1">渚涘簲鍟?/label>
                  <input
                    type="text"
                    value={newItem.supplier || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, supplier: e.target.value }))}
                    placeholder="渚涘簲鍟嗗悕绉?
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">闇€姹傛暟閲?/label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.requiredQty || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, requiredQty: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">鍗曚綅</label>
                  <select
                    value={newItem.unit || '濂?}
                    onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">澶囨枡鍛ㄦ湡锛堝ぉ锛?/label>
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
                <label className="block text-sm font-medium text-slate-600 mb-1">寮€濮嬩氦鏂欐棩鏈?/label>
                <input
                  type="date"
                  value={newItem.eta}
                  onChange={(e) => setNewItem((p) => ({ ...p, eta: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">榻愭枡鏃堕棿</label>
                <input
                  type="date"
                  value={newItem.materialReadyTime || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, materialReadyTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">鍒版枡鏃堕棿</label>
                <input
                  type="date"
                  value={newItem.arrivalTime || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, arrivalTime: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">椋庨櫓绋嬪害</label>
                  <select
                    value={newItem.riskLevel || '鏃?}
                    onChange={(e) => setNewItem((p) => ({ ...p, riskLevel: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {RISK_LEVELS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">澶囨敞</label>
                  <input
                    type="text"
                    value={newItem.remark || ''}
                    onChange={(e) => setNewItem((p) => ({ ...p, remark: e.target.value }))}
                    placeholder="閫夊～"
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
                鍙栨秷
              </button>
              <button
                onClick={addMaterial}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                娣诲姞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 澶囨敞瀹屾暣鏌ョ湅/缂栬緫寮圭獥 */}
      {remarkModalMaterialId != null || remarkModalKey != null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setRemarkModalMaterialId(null); setRemarkModalKey(null); setRemarkModalPhase(null) }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">澶囨敞</h2>
              <button type="button" onClick={() => { setRemarkModalMaterialId(null); setRemarkModalKey(null); setRemarkModalPhase(null) }} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              value={remarkModalValue}
              onChange={(e) => setRemarkModalValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="杈撳叆澶囨敞鍐呭..."
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setRemarkModalMaterialId(null); setRemarkModalKey(null); setRemarkModalPhase(null) }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">鍙栨秷</button>
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
                纭畾
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 椤圭洰闂鐐?Actions or Details 鏀惧ぇ棰勮/缂栬緫寮圭獥 */}
      {workbookDetailModal != null && (() => {
        const { category, entryId } = workbookDetailModal
        const entry = (workbookEntries[category] || []).find((e) => e.id === entryId)
        if (!entry) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setWorkbookDetailModal(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800">Actions or Details 鈥?{category}</h2>
                <button type="button" onClick={() => setWorkbookDetailModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <textarea
                value={workbookDetailContent}
                onChange={(e) => setWorkbookDetailContent(e.target.value)}
                className="flex-1 min-h-[200px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                placeholder="杈撳叆闂鎻忚堪鎴栬窡杩涙帾鏂?.."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setWorkbookDetailModal(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">鍙栨秷</button>
                <button
                  type="button"
                  onClick={() => { updateWorkbookEntry(category, entryId, 'content', workbookDetailContent); setWorkbookDetailModal(null) }}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                >
                  纭畾
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 椤圭洰璁″垝 - 澶囨敞鏀惧ぇ缂栬緫寮圭獥 */}
      {planCommentModal != null && (() => {
        const m = projectPlanMilestones.find((x) => x.id === planCommentModal)
        if (!m) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPlanCommentModal(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-800">澶囨敞 鈥?{m.label || '鑺傜偣'}</h2>
                <button type="button" onClick={() => setPlanCommentModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <textarea
                value={planCommentValue}
                onChange={(e) => setPlanCommentValue(e.target.value)}
                className="flex-1 min-h-[200px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="杈撳叆澶囨敞鎻忚堪..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setPlanCommentModal(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">鍙栨秷</button>
                <button
                  type="button"
                  onClick={() => { updateProjectPlanComment(planCommentModal, planCommentValue); setPlanCommentModal(null) }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  纭畾
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
