import { useState } from 'react'
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react'

export default function TrialIssuesPage({ projectName, onBack }) {
  const TRIAL_PHASES = ['DV1', 'DV2', 'PV']
  const [activePhase, setActivePhase] = useState('DV1')
  const [issues, setIssues] = useState(() => {
    const key = `tws-trial-issues-${projectName}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [saveHint, setSaveHint] = useState(false)
  
  const [newIssue, setNewIssue] = useState({
    description: '',
    owner: '',
    cause: '',
    priority: '中',
    status: '待处理'
  })

  const phaseIssues = issues.filter(i => i.phase === activePhase)

  const saveIssues = (newIssues) => {
    setIssues(newIssues)
    const key = `tws-trial-issues-${projectName}`
    localStorage.setItem(key, JSON.stringify(newIssues))
  }

  const addIssue = () => {
    const issue = {
      id: `issue_${Date.now()}`,
      phase: activePhase,
      ...newIssue,
      createdAt: new Date().toISOString()
    }
    const newIssues = [...issues, issue]
    saveIssues(newIssues)
    setNewIssue({ description: '', owner: '', cause: '', priority: '中', status: '待处理' })
    setShowAddModal(false)
    setSaveHint(true)
    setTimeout(() => setSaveHint(false), 2000)
  }

  const updateIssue = (id, field, value) => {
    const newIssues = issues.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value }
        if (field === 'status' && (value === '已解决' || value === '关闭')) {
          updated.resolvedAt = new Date().toISOString()
        }
        return updated
      }
      return i
    })
    saveIssues(newIssues)
  }

  const deleteIssue = (id) => {
    if (!window.confirm('确定删除该问题点？')) return
    const newIssues = issues.filter(i => i.id !== id)
    saveIssues(newIssues)
  }

  const getPriorityColor = (p) => {
    switch (p) {
      case '高': return 'bg-red-100 text-red-700 border-red-200'
      case '中': return 'bg-amber-100 text-amber-700 border-amber-200'
      case '低': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusColor = (s) => {
    switch (s) {
      case '待处理': return 'bg-red-100 text-red-700 border-red-200'
      case '处理中': return 'bg-blue-100 text-blue-700 border-blue-200'
      case '已解决': return 'bg-green-100 text-green-700 border-green-200'
      case '关闭': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            返回物料追踪
          </button>
          <h2 className="text-lg font-semibold text-slate-800">试产问题点跟踪</h2>
        </div>
        <div className="flex items-center gap-2">
          {saveHint && <span className="text-sm text-emerald-600">已保存</span>}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            添加问题点
          </button>
        </div>
      </div>

      {/* 阶段切换 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-slate-600">试产阶段：</span>
        {TRIAL_PHASES.map((p) => (
          <button
            key={p}
            onClick={() => setActivePhase(p)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              activePhase === p
                ? 'bg-slate-700 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 问题点列表 */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="text-left py-3 px-4 font-medium">问题描述</th>
                <th className="text-left py-3 px-4 font-medium w-32">负责人</th>
                <th className="text-left py-3 px-4 font-medium w-48">原因分析</th>
                <th className="text-left py-3 px-4 font-medium w-24">优先级</th>
                <th className="text-left py-3 px-4 font-medium w-28">状态</th>
                <th className="text-left py-3 px-4 font-medium w-32">提出时间</th>
                <th className="text-left py-3 px-4 font-medium w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {phaseIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    当前阶段暂无问题点，点击「添加问题点」开始记录
                  </td>
                </tr>
              ) : (
                phaseIssues.map((issue) => (
                  <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <textarea
                        value={issue.description}
                        onChange={(e) => updateIssue(issue.id, 'description', e.target.value)}
                        className="w-full min-h-[60px] rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        placeholder="问题描述"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={issue.owner}
                        onChange={(e) => updateIssue(issue.id, 'owner', e.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="负责人"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <textarea
                        value={issue.cause || ''}
                        onChange={(e) => updateIssue(issue.id, 'cause', e.target.value)}
                        className="w-full min-h-[60px] rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        placeholder="原因分析"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={issue.priority}
                        onChange={(e) => updateIssue(issue.id, 'priority', e.target.value)}
                        className={`w-full rounded border px-2 py-1 text-sm font-medium ${getPriorityColor(issue.priority)}`}
                      >
                        <option value="高">高</option>
                        <option value="中">中</option>
                        <option value="低">低</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={issue.status}
                        on