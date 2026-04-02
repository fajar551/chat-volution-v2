class ChatStatusService {
  constructor() {
    this.chatStatuses = new Map(); // Store chat status per phone
    this.statusListeners = new Map(); // Store status change listeners
  }

  // Set chat status
  setStatus(phone, status, agentId = null) {
    const previousStatus = this.chatStatuses.get(phone);
    console.log(`🔄 Setting status for ${phone}:`, {
      previousStatus,
      newStatus: status,
      agentId
    });

    this.chatStatuses.set(phone, {
      status: status, // 'unassigned' or 'assigned'
      agentId: agentId,
      assignedAt: status === 'assigned' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    });

    const newStatus = this.chatStatuses.get(phone);
    console.log(`📊 Chat status updated for ${phone}: ${previousStatus?.status || 'none'} → ${status}`);
    console.log(`📊 Final status object:`, newStatus);

    // Notify listeners
    this.notifyStatusChange(phone, status, agentId);
  }

  // Get chat status
  getStatus(phone) {
    return this.chatStatuses.get(phone) || {
      status: 'unassigned', // Default to unassigned to allow AI response
      agentId: null,
      assignedAt: null,
      updatedAt: new Date().toISOString()
    };
  }

  // Check if chat is assigned
  isAssigned(phone) {
    const status = this.getStatus(phone);
    return status.status === 'assigned';
  }

  // Check if chat is unassigned
  isUnassigned(phone) {
    const status = this.getStatus(phone);
    return status.status === 'unassigned';
  }

  // Assign chat to agent
  assignToAgent(phone, agentId) {
    console.log(`🔄 Assigning chat ${phone} to agent ${agentId}`);
    const previousStatus = this.getStatus(phone);
    console.log(`📊 Previous status:`, previousStatus);

    this.setStatus(phone, 'assigned', agentId);

    const newStatus = this.getStatus(phone);
    console.log(`📊 New status:`, newStatus);
    console.log(`👤 Chat ${phone} assigned to agent ${agentId}`);
  }

  // Unassign chat from agent
  unassignFromAgent(phone) {
    console.log(`🔄 Unassigning chat ${phone} from agent`);
    const previousStatus = this.getStatus(phone);
    console.log(`📊 Previous status:`, previousStatus);

    this.setStatus(phone, 'unassigned', null);

    const newStatus = this.getStatus(phone);
    console.log(`📊 New status:`, newStatus);
    console.log(`🔄 Chat ${phone} unassigned from agent`);
  }

  // Force unassign chat (for testing)
  forceUnassign(phone) {
    this.setStatus(phone, 'unassigned', null);
    console.log(`🔄 Force unassigned chat ${phone} for testing`);
  }

  // Get all assigned chats
  getAssignedChats() {
    const assigned = [];
    for (const [phone, status] of this.chatStatuses.entries()) {
      if (status.status === 'assigned') {
        assigned.push({ phone, ...status });
      }
    }
    return assigned;
  }

  // Get all unassigned chats
  getUnassignedChats() {
    const unassigned = [];
    for (const [phone, status] of this.chatStatuses.entries()) {
      if (status.status === 'unassigned') {
        unassigned.push({ phone, ...status });
      }
    }
    return unassigned;
  }

  // Add status change listener
  onStatusChange(phone, callback) {
    if (!this.statusListeners.has(phone)) {
      this.statusListeners.set(phone, []);
    }
    this.statusListeners.get(phone).push(callback);
  }

  // Remove status change listener
  offStatusChange(phone, callback) {
    if (this.statusListeners.has(phone)) {
      const listeners = this.statusListeners.get(phone);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Notify status change
  notifyStatusChange(phone, status, agentId) {
    if (this.statusListeners.has(phone)) {
      const listeners = this.statusListeners.get(phone);
      listeners.forEach(callback => {
        try {
          callback(status, agentId);
        } catch (error) {
          console.error('❌ Error in status change listener:', error);
        }
      });
    }
  }

  // Get status statistics
  getStatistics() {
    const stats = {
      total: this.chatStatuses.size,
      assigned: 0,
      unassigned: 0
    };

    for (const status of this.chatStatuses.values()) {
      if (status.status === 'assigned') {
        stats.assigned++;
      } else {
        stats.unassigned++;
      }
    }

    return stats;
  }
}

// Create singleton instance
const chatStatusService = new ChatStatusService();
export default chatStatusService;
