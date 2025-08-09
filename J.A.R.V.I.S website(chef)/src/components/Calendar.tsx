import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function Calendar() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    category: "personal",
    color: "#3b82f6",
    location: "",
  });

  const events = useQuery(api.calendar.listEvents, {});
  const createEvent = useMutation(api.calendar.createEvent);
  const deleteEvent = useMutation(api.calendar.deleteEvent);
  const upcomingEvents = useQuery(api.calendar.getUpcomingEvents, { limit: 5 });

  const categories = [
    { value: "personal", label: "Personal", color: "#3b82f6" },
    { value: "work", label: "Work", color: "#ef4444" },
    { value: "health", label: "Health", color: "#10b981" },
    { value: "social", label: "Social", color: "#f59e0b" },
    { value: "education", label: "Education", color: "#8b5cf6" },
  ];

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    try {
      await createEvent({
        title: newEvent.title,
        description: newEvent.description || undefined,
        startDate: newEvent.startDate.getTime(),
        endDate: newEvent.endDate.getTime(),
        allDay: newEvent.allDay,
        category: newEvent.category,
        color: newEvent.color,
        location: newEvent.location || undefined,
        reminders: [],
      });

      setNewEvent({
        title: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        allDay: false,
        category: "personal",
        color: "#3b82f6",
        location: "",
      });
      setShowAddForm(false);
      toast.success("Event created!");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent({ id: eventId as any });
      toast.success("Event deleted!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || "#3b82f6";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">📅 Calendar</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Event"}
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Create New Event</h3>
          
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Event title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Event description (optional)"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.startDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => {
                    const category = categories.find(c => c.value === e.target.value);
                    setNewEvent({ 
                      ...newEvent, 
                      category: e.target.value,
                      color: category?.color || "#3b82f6"
                    });
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Event location (optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newEvent.allDay}
                    onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">All day event</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Upcoming Events</h3>
        
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event._id}
                className="p-4 rounded-lg border border-white/10 bg-white/5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                      />
                      <h4 className="font-semibold text-white">{event.title}</h4>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                    )}
                    
                    <div className="text-sm text-gray-400">
                      <p>{formatDate(event.startDate)}</p>
                      {!event.allDay && (
                        <p>{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                      )}
                      {event.location && <p>📍 {event.location}</p>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-gray-400">No upcoming events</p>
            <p className="text-sm text-gray-500 mt-1">Create your first event to get started!</p>
          </div>
        )}
      </div>

      {/* All Events */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">All Events</h3>
        
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="p-4 rounded-lg border border-white/10 bg-white/5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    />
                    <h4 className="font-semibold text-white">{event.title}</h4>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{event.description}</p>
                )}
                
                <div className="text-sm text-gray-400">
                  <p>{formatDate(event.startDate)}</p>
                  {!event.allDay && (
                    <p>{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                  )}
                  {event.location && <p>📍 {event.location}</p>}
                  <span className="inline-block px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs mt-2">
                    {event.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-gray-400">No events yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first event to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
