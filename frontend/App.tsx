import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
} from 'react-native';

// ============================================================
// CONFIG - ชี้ไปที่ Server มหาวิทยาลัย (MySQL phpMyAdmin) เป็นค่าเริ่มต้น
// ============================================================
const REMOTE_API = 'http://119.59.102.161:3066';
const LOCAL_API = 'http://localhost:3001';

// ============================================================
// TYPES
// ============================================================
type Employee = {
  id: string;
  name: string;
  position: string;
  status: 'Active' | 'On Leave';
  salary: number;
};

type Cluster = {
  group: string;
  centroid: number;
  count: number;
};

type Screen = 'login' | 'dashboard';

// ============================================================
// COLORS
// ============================================================
const C = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  bg: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSub: '#64748B',
};

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

// ============================================================
// 1. LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin, apiBase, setApiBase }: { onLogin: () => void; apiBase: string; setApiBase: (url: string) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      const msg = 'Please enter both username and password';
      setError(msg);
      showAlert('Login Failed', msg);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin();
      } else {
        const msg = data.message || 'Invalid username or password';
        setError(msg);
        showAlert('Login Failed', msg);
      }
    } catch (e: any) {
      const msg = `Cannot connect to server at ${apiBase}. Please check server connection.`;
      setError(msg);
      showAlert('Connection Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={sL.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={sL.scroll} keyboardShouldPersistTaps="handled">
          
          {/* Server Selector Banner */}
          <View style={sL.serverBanner}>
            <Text style={sL.serverLabel}>📡 Target Server:</Text>
            <View style={sL.serverRow}>
              <TouchableOpacity
                style={[sL.serverBtn, apiBase === REMOTE_API && sL.serverBtnActive]}
                onPress={() => setApiBase(REMOTE_API)}
              >
                <Text style={[sL.serverBtnText, apiBase === REMOTE_API && sL.serverBtnTextActive]}>
                  🌐 MySQL (phpMyAdmin)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[sL.serverBtn, apiBase === LOCAL_API && sL.serverBtnActive]}
                onPress={() => setApiBase(LOCAL_API)}
              >
                <Text style={[sL.serverBtnText, apiBase === LOCAL_API && sL.serverBtnTextActive]}>
                  💻 Localhost:3001
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={sL.serverUrlText}>Connecting: {apiBase}</Text>
          </View>

          <View style={sL.logoBox}>
            <Text style={sL.emoji}>👔</Text>
            <Text style={sL.title}>HR Manager</Text>
            <Text style={sL.subtitle}>Employee Management & Salary Analytics</Text>
          </View>

          <View style={sL.card}>
            <Text style={sL.cardTitle}>Sign In</Text>

            {error ? (
              <View style={sL.errorBox}>
                <Text style={sL.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            <Text style={sL.label}>Username</Text>
            <TextInput
              style={sL.input}
              value={username}
              onChangeText={t => { setUsername(t); setError(''); }}
              placeholder="Enter username (admin)"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={sL.label}>Password</Text>
            <TextInput
              style={sL.input}
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              placeholder="Enter password (password123)"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[sL.btn, loading && sL.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={sL.btnText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={sL.credentialsBox}>
              <Text style={sL.credTitle}>🔑 Default Credentials:</Text>
              <Text style={sL.credText}>Username: <Text style={{ fontWeight: '700' }}>admin</Text></Text>
              <Text style={sL.credText}>Password: <Text style={{ fontWeight: '700' }}>password123</Text></Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const sL = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  serverBanner: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  serverLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
  serverRow: { flexDirection: 'row', gap: 8 },
  serverBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center', backgroundColor: '#F8FAFC' },
  serverBtnActive: { backgroundColor: '#EFF6FF', borderColor: C.primary, borderWidth: 2 },
  serverBtnText: { fontSize: 12, fontWeight: '600', color: C.textSub },
  serverBtnTextActive: { color: C.primary, fontWeight: '700' },
  serverUrlText: { fontSize: 11, color: C.textSub, marginTop: 6, textAlign: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 24 },
  emoji: { fontSize: 48, marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 13, color: C.textSub, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: C.card, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: C.border,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 18 },
  errorBox: {
    backgroundColor: '#FEF2F2', borderColor: '#FCA5A5',
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: C.danger, fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48,
    fontSize: 15, color: C.text, marginBottom: 16,
  },
  btn: { backgroundColor: C.primary, borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  credentialsBox: { marginTop: 18, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: C.border },
  credTitle: { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 4 },
  credText: { fontSize: 12, color: C.textSub },
});

// ============================================================
// 2. EMPLOYEE CARD COMPONENT
// ============================================================
function EmployeeCard({
  emp, onToggle, onDelete,
}: {
  emp: Employee;
  onToggle: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const isActive = emp.status === 'Active';
  return (
    <View style={sE.card}>
      <View style={sE.row}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={sE.idBadge}>#{emp.id}</Text>
            <Text style={sE.name}>{emp.name}</Text>
          </View>
          <Text style={sE.position}>{emp.position}</Text>
          <Text style={sE.salary}>฿{Number(emp.salary).toLocaleString()}</Text>
        </View>
        <View style={[sE.badge, isActive ? sE.badgeActive : sE.badgeLeave]}>
          <Text style={[sE.badgeText, isActive ? sE.badgeActiveText : sE.badgeLeaveText]}>
            {emp.status}
          </Text>
        </View>
      </View>
      <View style={sE.actions}>
        <TouchableOpacity
          style={[sE.actionBtn, sE.toggleBtn]}
          onPress={() => onToggle(emp.id)}
          activeOpacity={0.8}
        >
          <Text style={sE.toggleText}>
            {isActive ? '⏸ Set On Leave' : '▶ Set Active'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sE.actionBtn, sE.deleteBtn]}
          onPress={() => onDelete(emp.id, emp.name)}
          activeOpacity={0.8}
        >
          <Text style={sE.deleteText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sE = StyleSheet.create({
  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: C.border,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  idBadge: { fontSize: 12, fontWeight: '700', color: C.textSub, backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  name: { fontSize: 16, fontWeight: '700', color: C.text },
  position: { fontSize: 13, color: C.textSub, marginTop: 2 },
  salary: { fontSize: 15, fontWeight: '700', color: C.primary, marginTop: 4 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgeLeave: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeActiveText: { color: '#065F46' },
  badgeLeaveText: { color: '#92400E' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  toggleBtn: { borderColor: C.warning, backgroundColor: '#FFFBEB' },
  deleteBtn: { borderColor: C.danger, backgroundColor: '#FEF2F2', flex: 0.6 },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  deleteText: { fontSize: 12, fontWeight: '600', color: C.danger },
});

// ============================================================
// 3. K-MEANS CLUSTER SUMMARY CARD
// ============================================================
function ClusterCard({ cluster, index }: { cluster: Cluster; index: number }) {
  const colors = ['#10B981', '#3B82F6', '#8B5CF6'];
  const bgs = ['#ECFDF5', '#EFF6FF', '#F5F3FF'];
  const color = colors[index] ?? C.primary;
  const bgColor = bgs[index] ?? '#F8FAFC';
  return (
    <View style={[sC.card, { borderLeftColor: color, backgroundColor: bgColor }]}>
      <View style={sC.headerRow}>
        <Text style={[sC.tier, { color }]}>{cluster.group}</Text>
        <Text style={sC.countBadge}>{cluster.count} Employee{cluster.count !== 1 ? 's' : ''}</Text>
      </View>
      <Text style={sC.centroidLabel}>Average Base Salary (Centroid):</Text>
      <Text style={[sC.centroidValue, { color }]}>฿{Number(cluster.centroid).toLocaleString()}</Text>
    </View>
  );
}

const sC = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 5, borderWidth: 1, borderColor: C.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tier: { fontSize: 18, fontWeight: '800' },
  countBadge: { fontSize: 13, fontWeight: '700', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, color: C.text },
  centroidLabel: { fontSize: 12, color: C.textSub, marginTop: 8 },
  centroidValue: { fontSize: 22, fontWeight: '800', marginTop: 2 },
});

// ============================================================
// 4. DASHBOARD SCREEN
// ============================================================
function DashboardScreen({ onLogout, apiBase }: { onLogout: () => void; apiBase: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  const [loadingCluster, setLoadingCluster] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // GET /api/employees
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/employees`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (e) {
      showAlert('Error', `Cannot fetch employees from ${apiBase}`);
    } finally {
      setLoadingEmp(false);
    }
  }, [apiBase]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // POST /api/employees
  const handleAdd = async () => {
    if (!name.trim()) {
      const msg = 'Please enter employee name';
      setAddError(msg);
      showAlert('Validation Error', msg);
      return;
    }
    if (!position.trim()) {
      const msg = 'Please enter position';
      setAddError(msg);
      showAlert('Validation Error', msg);
      return;
    }
    if (!salary.trim()) {
      const msg = 'Please enter salary';
      setAddError(msg);
      showAlert('Validation Error', msg);
      return;
    }
    const salaryNum = Number(salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      const msg = 'Salary must be a positive numeric value';
      setAddError(msg);
      showAlert('Validation Error', msg);
      return;
    }

    setAddError('');
    setAdding(true);
    try {
      const res = await fetch(`${apiBase}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), position: position.trim(), salary: salaryNum }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setName(''); setPosition(''); setSalary('');
        setShowAddForm(false);
        setClusters(null);
        await fetchEmployees(); // Live update
        showAlert('Success', `Added employee "${data.employee.name}" successfully! Saved to ${apiBase.includes('119') ? 'phpMyAdmin MySQL' : 'Localhost'}`);
      } else {
        const msg = data.message || 'Failed to add employee';
        setAddError(msg);
        showAlert('Error', msg);
      }
    } catch (e) {
      const msg = `Cannot connect to server at ${apiBase}`;
      setAddError(msg);
      showAlert('Error', msg);
    } finally {
      setAdding(false);
    }
  };

  // PUT /api/employees/:id/status
  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/employees/${id}/status`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployees(prev => prev.map(e => e.id === id ? data.employee : e));
        setClusters(null);
      } else {
        showAlert('Error', data.message || 'Cannot toggle status');
      }
    } catch (e) {
      showAlert('Error', 'Cannot connect to server to update status');
    }
  };

  // DELETE /api/employees/:id
  const performDelete = async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployees(prev => prev.filter(e => e.id !== id));
        setClusters(null);
        showAlert('Deleted', 'Employee has been deleted from database.');
      } else {
        showAlert('Error', data.message || 'Cannot delete employee');
      }
    } catch (e) {
      showAlert('Error', 'Cannot connect to server to delete employee');
    }
  };

  const handleDelete = (id: string, empName: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(`Are you sure you want to delete ${empName}?`);
      if (confirmed) {
        performDelete(id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${empName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => performDelete(id) },
        ]
      );
    }
  };

  // GET /api/employees/salary-clusters
  const handleAnalyze = async () => {
    setLoadingCluster(true);
    setClusters(null);
    try {
      const res = await fetch(`${apiBase}/api/employees/salary-clusters`);
      const data = await res.json();
      if (res.ok && data.success) {
        setClusters(data.clusters);
      } else {
        showAlert('Analysis Error', data.message || 'Clustering analysis failed.');
      }
    } catch (e) {
      showAlert('Connection Error', 'Cannot connect to server to analyze salary structure.');
    } finally {
      setLoadingCluster(false);
    }
  };

  return (
    <SafeAreaView style={sD.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView style={sD.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={sD.header}>
          <View>
            <Text style={sD.headerTitle}>👔 HR Manager Dashboard</Text>
            <Text style={sD.headerSub}>
              Connected: <Text style={{ fontWeight: '700', color: C.primary }}>{apiBase.includes('119') ? 'phpMyAdmin MySQL (Server)' : 'Localhost'}</Text>
            </Text>
          </View>
          <TouchableOpacity style={sD.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Text style={sD.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Phase 2: Analyze Salary Structure Button */}
        <TouchableOpacity
          style={[sD.analyzeBtn, loadingCluster && sD.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={loadingCluster}
          activeOpacity={0.8}
        >
          {loadingCluster ? (
            <View style={sD.loadingRow}>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={sD.analyzeBtnText}>Calculating K-Means Clusters...</Text>
            </View>
          ) : (
            <Text style={sD.analyzeBtnText}>📊 Analyze Salary Structure (K-Means)</Text>
          )}
        </TouchableOpacity>

        {/* Phase 2: Cluster Results Summary Cards */}
        {clusters && (
          <View style={sD.clusterBox}>
            <Text style={sD.sectionTitle}>🎯 Salary Clustering Results (k=3)</Text>
            <Text style={sD.clusterSub}>Grouped using 1D K-Means algorithm based on employee salaries:</Text>
            {clusters.map((c, i) => <ClusterCard key={c.group} cluster={c} index={i} />)}
          </View>
        )}

        {/* Add Employee Form Toggle */}
        <TouchableOpacity
          style={[sD.addToggleBtn, showAddForm && sD.addToggleBtnActive]}
          onPress={() => { setShowAddForm(!showAddForm); setAddError(''); }}
          activeOpacity={0.8}
        >
          <Text style={[sD.addToggleText, showAddForm && sD.addToggleTextActive]}>
            {showAddForm ? '✕  Cancel Add Employee' : '＋  Add Employee Form'}
          </Text>
        </TouchableOpacity>

        {/* Add Employee Form */}
        {showAddForm && (
          <View style={sD.formCard}>
            <Text style={sD.sectionTitle}>Add New Employee (Saves to Database)</Text>

            {addError ? (
              <View style={sD.addErrorBox}>
                <Text style={sD.addErrorText}>⚠️  {addError}</Text>
              </View>
            ) : null}

            <Text style={sD.label}>Employee Name *</Text>
            <TextInput
              style={sD.input}
              value={name}
              onChangeText={t => { setName(t); setAddError(''); }}
              placeholder="e.g. John Doe"
            />
            <Text style={sD.label}>Position *</Text>
            <TextInput
              style={sD.input}
              value={position}
              onChangeText={t => { setPosition(t); setAddError(''); }}
              placeholder="e.g. Software Engineer"
            />
            <Text style={sD.label}>Monthly Salary (฿) *</Text>
            <TextInput
              style={sD.input}
              value={salary}
              onChangeText={t => { setSalary(t); setAddError(''); }}
              placeholder="e.g. 45000"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[sD.addBtn, adding && sD.addBtnDisabled]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.8}
            >
              {adding
                ? <ActivityIndicator color="#fff" />
                : <Text style={sD.addBtnText}>Save Employee to Database</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Employee List */}
        <View style={{ marginTop: 10 }}>
          <View style={sD.listHeaderRow}>
            <Text style={sD.sectionTitle}>Employee Records ({employees.length})</Text>
            <TouchableOpacity onPress={fetchEmployees} style={sD.refreshBtn}>
              <Text style={sD.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingEmp ? (
            <ActivityIndicator color={C.primary} size="large" style={{ marginTop: 24 }} />
          ) : employees.length === 0 ? (
            <Text style={sD.emptyText}>No employees found. Please add a new employee above.</Text>
          ) : (
            employees.map(emp => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const sD = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.textSub, marginTop: 2 },
  logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  logoutText: { color: C.danger, fontWeight: '700', fontSize: 13 },
  analyzeBtn: { backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 14 },
  analyzeBtnDisabled: { opacity: 0.7 },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  clusterBox: { marginBottom: 16, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  clusterSub: { fontSize: 12, color: C.textSub, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  refreshBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  refreshText: { fontSize: 12, color: C.primary, fontWeight: '600' },
  addToggleBtn: { borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: C.primary, borderStyle: 'dashed', backgroundColor: C.card },
  addToggleBtnActive: { borderStyle: 'solid', backgroundColor: '#FEF2F2', borderColor: C.danger },
  addToggleText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  addToggleTextActive: { color: C.danger },
  formCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 46, fontSize: 14, color: C.text, marginBottom: 12 },
  addErrorBox: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 },
  addErrorText: { color: C.danger, fontSize: 13 },
  addBtn: { backgroundColor: C.primary, borderRadius: 12, height: 46, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  addBtnDisabled: { opacity: 0.7 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyText: { textAlign: 'center', color: C.textSub, marginTop: 20, fontSize: 14 },
});

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [apiBase, setApiBase] = useState<string>(REMOTE_API);

  return screen === 'login'
    ? <LoginScreen onLogin={() => setScreen('dashboard')} apiBase={apiBase} setApiBase={setApiBase} />
    : <DashboardScreen onLogout={() => setScreen('login')} apiBase={apiBase} />;
}
