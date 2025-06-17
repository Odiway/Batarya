'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Download,
  Users,
  Edit,
  Trash2,
  Clock,
  MapPin,
  FileText,
  Battery,
} from 'lucide-react'; // Battery ikonu eklendi

interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold'; // 'on-hold' eklendi
  // Batarya Laboratuvarı'na özel yeni alanlar:
  batteryModel?: string; // Örn: "TRESS 35", "TRESS 102"
  testType?:
    | 'Şarj Testi'
    | 'Deşarj Testi'
    | 'Montaj'
    | 'Demontaj'
    | 'Kalite Kontrol'
    | 'Arıza Tespiti';
  testResult?: 'Başarılı' | 'Başarısız' | 'Devam Ediyor'; // Test sonucu durumu
}

const WorkPlannerCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Batarya Laboratuvarı görevleri ile başlangıç verileri
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'TRESS 35 Şarj Testi',
      description: 'Batarya TRESS 35 için tam şarj döngüsü testi, logları kaydet.',
      assignedTo: ['1', '3'],
      date: '2025-06-16',
      startTime: '09:00',
      endTime: '12:00',
      location: 'Şarj Hattı 1',
      priority: 'high',
      status: 'in-progress',
      batteryModel: 'TRESS 35',
      testType: 'Şarj Testi',
      testResult: 'Devam Ediyor',
    },
    {
      id: '2',
      title: 'TRESS 102 Montajı',
      description: 'Yeni TRESS 102 batarya paketinin montajı ve bağlantı kontrolü.',
      assignedTo: ['2'],
      date: '2025-06-17',
      startTime: '10:00',
      endTime: '16:00',
      location: 'Montaj Hattı 2',
      priority: 'high',
      status: 'pending',
      batteryModel: 'TRESS 102',
      testType: 'Montaj',
    },
    {
      id: '3',
      title: 'TRESS 48 Deşarj Analizi',
      description: 'Hatalı TRESS 48 batarya için deşarj eğrisi analizi ve arıza tespiti.',
      assignedTo: ['1'],
      date: '2025-06-18',
      startTime: '13:00',
      endTime: '17:00',
      location: 'E-Lab Test Masası',
      priority: 'medium',
      status: 'pending',
      batteryModel: 'TRESS 48',
      testType: 'Deşarj Testi',
      testResult: 'Devam Ediyor',
    },
    {
      id: '4',
      title: 'Punta Makinası Periyodik Kontrolü',
      description: 'Pil punta makinasının aylık rutin bakımı ve kalibrasyonu.',
      assignedTo: ['3', '4'],
      date: '2025-06-19',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Punta Makinası Alanı',
      priority: 'low',
      status: 'completed',
      testType: 'Kalite Kontrol',
    },
    {
      id: '5',
      title: 'TRESS 75 Arıza Tespiti',
      description: 'Sahadan gelen TRESS 75 batarya paketindeki voltaj düşüşü arızasının tespiti.',
      assignedTo: ['1'],
      date: '2025-06-20',
      startTime: '10:00',
      endTime: '14:00',
      location: 'Arıza Tespit Alanı',
      priority: 'high',
      status: 'pending',
      batteryModel: 'TRESS 75',
      testType: 'Arıza Tespiti',
    },
  ]);

  // Batarya Laboratuvarı rolleri ile takım üyeleri
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Ayşe Yılmaz', role: 'Batarya Mühendisi', color: '#3B82F6' },
    { id: '2', name: 'Mehmet Demir', role: 'Usta (Montaj)', color: '#10B981' },
    { id: '3', name: 'Fatma Kara', role: 'Usta (Test)', color: '#F59E0B' },
    { id: '4', name: 'Can Tekin', role: 'Kalite Kontrol', color: '#EF4444' },
    { id: '5', name: 'Deniz Aksu', role: 'Elektronik Mühendisi', color: '#6B46C1' },
  ]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Form states - Yeni alanlar eklendi
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    priority: 'medium' as Task['priority'],
    batteryModel: '', // Yeni
    testType: '' as Task['testType'], // Yeni
    testResult: '' as Task['testResult'], // Yeni
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    color: '#3B82F6',
  });

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter((task) => task.date === date);
  };

  const handleAddTask = () => {
    if (!taskForm.title || !taskForm.date) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      date: taskForm.date,
      startTime: taskForm.startTime,
      endTime: taskForm.endTime,
      location: taskForm.location,
      priority: taskForm.priority,
      status: 'pending', // Yeni görevler başlangıçta 'pending'
      batteryModel: taskForm.batteryModel, // Yeni
      testType: taskForm.testType, // Yeni
      testResult: taskForm.testResult, // Yeni
    };

    setTasks([...tasks, newTask]);
    resetTaskForm();
    setShowTaskModal(false);
  };

  const handleEditTask = () => {
    if (!editingTask || !taskForm.title || !taskForm.date) return;

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id
        ? {
            ...task,
            title: taskForm.title,
            description: taskForm.description,
            assignedTo: taskForm.assignedTo,
            date: taskForm.date,
            startTime: taskForm.startTime,
            endTime: taskForm.endTime,
            location: taskForm.location,
            priority: taskForm.priority,
            batteryModel: taskForm.batteryModel, // Yeni
            testType: taskForm.testType, // Yeni
            testResult: taskForm.testResult, // Yeni
          }
        : task,
    );

    setTasks(updatedTasks);
    resetTaskForm();
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleAddTeamMember = () => {
    if (!memberForm.name || !memberForm.role) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: memberForm.name,
      role: memberForm.role,
      color: memberForm.color,
    };

    setTeamMembers([...teamMembers, newMember]);
    resetMemberForm();
    setShowTeamModal(false);
  };

  const handleEditTeamMember = () => {
    if (!editingMember || !memberForm.name || !memberForm.role) return;

    const updatedMembers = teamMembers.map((member) =>
      member.id === editingMember.id
        ? {
            ...member,
            name: memberForm.name,
            role: memberForm.role,
            color: memberForm.color,
          }
        : member,
    );

    setTeamMembers(updatedMembers);
    resetMemberForm();
    setEditingMember(null);
    setShowTeamModal(false);
  };

  const handleDeleteTeamMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    // Üye silindiğinde ilgili görevlerden de atamayı kaldır
    const updatedTasks = tasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo.filter((id) => id !== memberId),
    }));
    setTasks(updatedTasks);
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignedTo: [],
      date: selectedDate || '',
      startTime: '',
      endTime: '',
      location: '',
      priority: 'medium',
      batteryModel: '', // Sıfırla
      testType: '' as Task['testType'], // Sıfırla
      testResult: '' as Task['testResult'], // Sıfırla
    });
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      role: '',
      color: '#3B82F6',
    });
  };

  const openTaskModal = (date?: string) => {
    setSelectedDate(date || '');
    setTaskForm({ ...taskForm, date: date || '' });
    setEditingTask(null); // Yeni görev eklerken edit modunu sıfırla
    resetTaskForm(); // Formu sıfırla
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
      location: task.location || '',
      priority: task.priority,
      batteryModel: task.batteryModel || '', // Yeni
      testType: task.testType || ('' as Task['testType']), // Yeni
      testResult: task.testResult || ('' as Task['testResult']), // Yeni
    });
    setShowTaskModal(true);
  };

  const openEditMemberModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      role: member.role,
      color: member.color,
    });
    setShowTeamModal(true);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
    setTasks(updatedTasks);
  };

  const exportToJSON = () => {
    const data = {
      tasks,
      teamMembers,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work-planner-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = [
      'Başlık',
      'Açıklama',
      'Atanan Kişiler',
      'Tarih',
      'Başlangıç Saati',
      'Bitiş Saati',
      'Konum',
      'Öncelik',
      'Durum',
      'Batarya Modeli',
      'Test Tipi',
      'Test Sonucu', // Yeni başlıklar
    ];
    const csvContent = [
      headers.join(';'), // CSV'de sütunları ayırmak için ';' kullanmak bazı Excel versiyonlarında daha iyi olabilir
      ...tasks.map((task) =>
        [
          `"${task.title.replace(/"/g, '""')}"`, // Başlıkta tırnak varsa kaçış yap
          `"${task.description.replace(/"/g, '""')}"`, // Açıklamada tırnak varsa kaçış yap
          `"${task.assignedTo
            .map((id) => teamMembers.find((m) => m.id === id)?.name)
            .join(', ')
            .replace(/"/g, '""')}"`,
          task.date,
          task.startTime,
          task.endTime,
          `"${(task.location || '').replace(/"/g, '""')}"`,
          task.priority,
          task.status,
          `"${(task.batteryModel || '').replace(/"/g, '""')}"`, // Yeni
          `"${(task.testType || '').replace(/"/g, '""')}"`, // Yeni
          `"${(task.testResult || '').replace(/"/g, '""')}"`, // Yeni
        ].join(';'),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Karakter seti belirtildi
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batarya-lab-planlayici-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const days = getDaysInMonth(currentDate);
  // Ay isimleri Türkçe'ye çevrildi
  const monthNames = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Batarya Laboratuvarı Görev Planlayıcı
                </h1>
                <p className="text-gray-600">
                  Ekibinizin batarya laboratuvarı işlerini verimli yönetin
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Users className="w-4 h-4" />
                Ekibi Yönet
              </button>
              <button
                onClick={() => openTaskModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                Görev Ekle
              </button>
              <div className="flex gap-2">
                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  JSON İndir
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  CSV İndir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  ← Önceki
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  Sonraki →
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4 border-b pb-2">
                {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(
                  (
                    day, // Gün isimleri Türkçe'ye çevrildi
                  ) => (
                    <div key={day} className="text-center font-bold text-gray-700 py-2">
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dateStr = formatDate(day.date);
                  const dayTasks = getTasksForDate(dateStr);
                  const isToday = formatDate(new Date()) === dateStr;

                  return (
                    <div
                      key={index}
                      className={`min-h-28 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex flex-col ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-200'}`}
                      onClick={() => openTaskModal(dateStr)}
                    >
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isToday ? 'text-blue-600' : ''}`}
                      >
                        {day.date.getDate()}
                      </div>
                      <div className="flex-grow space-y-1 overflow-hidden">
                        {' '}
                        {/* flex-grow ile içerik sıkışınca scroll olacak */}
                        {dayTasks.slice(0, 2).map(
                          (
                            task, // Günde sadece ilk 2 görevi göster
                          ) => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded truncate flex items-center gap-1
                              ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              } ${task.status === 'completed' ? 'opacity-70 line-through' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation(); // Takvim günü tıklamasını engelle
                                openEditTaskModal(task);
                              }}
                            >
                              <Battery className="w-3 h-3 flex-shrink-0" /> {/* Batarya ikonu */}
                              <span className="flex-grow truncate">{task.title}</span>
                            </div>
                          ),
                        )}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{dayTasks.length - 2} diğer görev
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Team Members */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Ekip Üyeleri
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {' '}
                {/* Yüksekliği sınırlayarak scroll eklendi */}
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditMemberModal(member)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="p-1 hover:bg-gray-200 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Battery Lab Tasks */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Güncel Batarya Laboratuvarı İşlemleri
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {' '}
                {/* Yüksekliği sınırlayarak scroll eklendi */}
                {tasks
                  .filter((task) => task.status !== 'completed')
                  .slice(0, 5)
                  .map(
                    (
                      task, // Tamamlanmayan ilk 5 görevi göster
                    ) => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900 truncate pr-2">
                            {task.title}
                          </div>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(task.id, e.target.value as Task['status'])
                            }
                            className="text-xs border rounded px-2 py-1 bg-white"
                          >
                            <option value="pending">Beklemede</option>
                            <option value="in-progress">Devam Ediyor</option>
                            <option value="on-hold">Askıya Alındı</option> {/* Yeni statü */}
                            <option value="completed">Tamamlandı</option>
                          </select>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.date} • {task.startTime} -{' '}
                          {task.endTime}
                        </div>
                        {task.location && (
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {task.location}
                          </div>
                        )}
                        {task.batteryModel && (
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Battery className="w-3 h-3" /> Model: {task.batteryModel}
                          </div>
                        )}
                        {task.testType && (
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3" /> Test Tipi: {task.testType}
                          </div>
                        )}
                        {task.testResult && (
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <span>Sonuç:</span>
                            <span
                              className={`font-semibold ${task.testResult === 'Başarılı' ? 'text-green-600' : task.testResult === 'Başarısız' ? 'text-red-600' : 'text-yellow-600'}`}
                            >
                              {task.testResult}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.assignedTo.map((memberId) => {
                            const member = teamMembers.find((m) => m.id === memberId);
                            return member ? (
                              <span
                                key={memberId}
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: member.color }}
                              >
                                {member.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(task);
                            }}
                            className="flex-1 text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <Edit className="w-3 h-3 inline-block mr-1" /> Düzenle
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="flex-1 text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 inline-block mr-1" /> Sil
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                {tasks.filter((task) => task.status !== 'completed').length > 5 && (
                  <div className="text-sm text-gray-500 text-center mt-3">
                    ...daha fazla görev var
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Görev başlığını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Görev açıklamasını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atanan Kişiler
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {teamMembers.map((member) => (
                      <label key={member.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={taskForm.assignedTo.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTaskForm({
                                ...taskForm,
                                assignedTo: [...taskForm.assignedTo, member.id],
                              });
                            } else {
                              setTaskForm({
                                ...taskForm,
                                assignedTo: taskForm.assignedTo.filter((id) => id !== member.id),
                              });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-800">
                          {member.name} - {member.role}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={taskForm.date}
                      onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlangıç Saati
                    </label>
                    <input
                      type="time"
                      value={taskForm.startTime}
                      onChange={(e) => setTaskForm({ ...taskForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitiş Saati
                    </label>
                    <input
                      type="time"
                      value={taskForm.endTime}
                      onChange={(e) => setTaskForm({ ...taskForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                  <input
                    type="text"
                    value={taskForm.location}
                    onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Konum girin (opsiyonel)"
                  />
                </div>

                {/* Yeni Batarya Lab'ı alanları */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batarya Modeli
                  </label>
                  <input
                    type="text"
                    value={taskForm.batteryModel}
                    onChange={(e) => setTaskForm({ ...taskForm, batteryModel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: TRESS 35"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test/İşlem Tipi
                  </label>
                  <select
                    value={taskForm.testType}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, testType: e.target.value as Task['testType'] })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Şarj Testi">Şarj Testi</option>
                    <option value="Deşarj Testi">Deşarj Testi</option>
                    <option value="Montaj">Montaj</option>
                    <option value="Demontaj">Demontaj</option>
                    <option value="Kalite Kontrol">Kalite Kontrol</option>
                    <option value="Arıza Tespiti">Arıza Tespiti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Sonucu
                  </label>
                  <select
                    value={taskForm.testResult}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, testResult: e.target.value as Task['testResult'] })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Başarılı">Başarılı</option>
                    <option value="Başarısız">Başarısız</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                  </select>
                </div>
              </div>{' '}
              {/* End of space-y-4 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    resetTaskForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  İptal
                </button>
                <button
                  onClick={editingTask ? handleEditTask : handleAddTask}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  {editingTask ? 'Görevi Güncelle' : 'Görev Ekle'}
                </button>
                {editingTask && (
                  <button
                    onClick={() => {
                      handleDeleteTask(editingTask.id);
                      setShowTaskModal(false);
                      setEditingTask(null);
                      resetTaskForm();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <Trash2 className="w-4 h-4" /> Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Member Modal */}
        {showTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingMember ? 'Ekip Üyesini Düzenle' : 'Ekip Üyesi Ekle'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                  <input
                    type="text"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Üye adı girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <input
                    type="text"
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Üye rolü girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                  <input
                    type="color"
                    value={memberForm.color}
                    onChange={(e) => setMemberForm({ ...memberForm, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTeamModal(false);
                    setEditingMember(null);
                    resetMemberForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  İptal
                </button>
                <button
                  onClick={editingMember ? handleEditTeamMember : handleAddTeamMember}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  {editingMember ? 'Üyeyi Güncelle' : 'Üye Ekle'}
                </button>
                {editingMember && (
                  <button
                    onClick={() => {
                      handleDeleteTeamMember(editingMember.id);
                      setShowTeamModal(false);
                      setEditingMember(null);
                      resetMemberForm();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <Trash2 className="w-4 h-4" /> Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPlannerCalendar;
