// 增强版甘特图组件代码
// 由于代码量较大，我将直接修改 App.jsx 文件

const GANTT_ENHANCED_CODE = `
  // 甘特图条形位置计算（支持时间轴缩放）
  const getBarStyle = (task, range, cellWidth = 40) => {
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
      left: \`\${Math.max(0, left)}%\`,
      width: \`\${Math.max(2, width)}%\`
    }
  }

  // 生成时间轴刻度
  const generateTimeScale = (range, maxTicks = 20) => {
    if (!range) return []
    const days = Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24))
    const interval = Math.ceil(days / maxTicks)
    const ticks = []
    
    for (let i = 0; i <= days; i += interval) {
      const date = new Date(range.start)
      date.setDate(date.getDate() + i)
      ticks.push({
        date,
        label: \`\${date.getMonth() + 1}/\${date.getDate()}\`,
        position: (i / days) * 100
      })
    }
    return ticks
  }

  // 里程碑节点页面（原有功能）
  const MilestonePage = () => {
    const [milestones, setMilestones] = useState([
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
    const [columns, setColumns] = useState([
      { id: 'pc_0', name: 'Original Plan' },
      { id: 'pc_1', name: 'Actual plan' }
    ])
    const [cells, setCells] = useState({})
    const [comments, setComments] = useState({})
    const [commentModal, setCommentModal] = useState(null)
    const [commentValue, setCommentValue] = useState('')

    const addMilestone = () => {
      setMilestones([...milestones, { id: \`pm_\${Date.now()}\`, label: '新节点' }])
    }
    const addColumn = () => {
      setColumns([...columns, { id: \`pc_\${Date.now()}\`, name: '新列' }])
    }
    const updateMilestone = (id, label) => {
      setMilestones(milestones.map(m => m.id === id ? { ...m, label } : m))
    }
    const updateColumn = (id, name) => {
      setColumns(columns.map(c => c.id === id ? { ...c, name } : c))
    }
    const deleteMilestone = (id) => {
      if (milestones.length <= 1) return
      setMilestones(milestones.filter(m => m.id !== id))
    }
    const deleteColumn = (id) => {
      if (columns.length <= 1) return
      setColumns(columns.filter(c => c.id !== id))
    }
    const updateCell = (milestoneId, colId, value) => {
      setCells({ ...cells, [\`\${milestoneId}_\${colId}\`]: value })
    }
    const updateComment = (milestoneId, value) => {
      setComments({ ...comments, [milestoneId]: value })
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
                          type="text"
                          value={cells[\`\${m.id}_\${col.id}\`] || ''}
                          onChange={(e) => updateCell(m.id, col.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="日期如 2025/1/8"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-2 border border-slate-200 align-top">
                      <div
                        onClick={() => { setCommentModal(m.id); setCommentValue(comments[m.id] || '') }}
                        className="flex items-start gap-1 min-h-[44px] rounded border border-slate-300 px-2 py-1.5 text-slate-800 text-xs text-left cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 w-full"
                      >
                        <span className="flex-1 min-w-0 line-clamp-3">
                          {(comments[m.id] || '').trim() || <span