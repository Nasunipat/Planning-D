import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Search, Filter, Settings, Truck, MapPin, Package, Clock, DollarSign, Users, FileText, AlertCircle, ChevronDown, Menu, X, Play, Save, RefreshCw, PlusCircle, Edit2, Trash2, CheckCircle, Copy, Calendar, Bell, Plus, FileSpreadsheet, Phone, CreditCard, Camera, CalendarDays, Eye, FileDown, Navigation, Route, GripVertical, Hand, MousePointer } from 'lucide-react';
const RoutePlanningSystem = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedVehicleType, setSelectedVehicleType] = useState('ทุกประเภทรถ');
  const [selectedStatus, setSelectedStatus] = useState('ทุกสถานะ');
  const [selectedCostRange, setSelectedCostRange] = useState('ทุกช่วงต้นทุน');
  const [selectedDistanceRange, setSelectedDistanceRange] = useState('ทุกช่วงระยะทาง');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [draggedTrip, setDraggedTrip] = useState(null);
  const [draggedBranch, setDraggedBranch] = useState(null);
  const [draggedFromTrip, setDraggedFromTrip] = useState(null);
  const [selectedBranchToMove, setSelectedBranchToMove] = useState(null);
  const [showQuickMoveModal, setShowQuickMoveModal] = useState(false);
  const [selectedForDrag, setSelectedForDrag] = useState(null);
  const [showDropConfirm, setShowDropConfirm] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hoveredTrip, setHoveredTrip] = useState(null);
  const [dragMethod, setDragMethod] = useState(null); // 'drag' or 'click'
  const fileInputRef = useRef(null);
  const driverPhotoRef = useRef(null);
  // Google Maps
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  // Initialize Google Maps
  useEffect(() => {
    if (activeTab === 'planning' && window.google) {
      const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 13.7563, lng: 100.5018 }, // Bangkok
        zoom: 11,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });
      
      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#029D84',
          strokeWeight: 4
        }
      });
      
      directionsRendererInstance.setMap(mapInstance);
      
      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
    }
  }, [activeTab]);
  // Orders data
  const [orders, setOrders] = useState([
    { id: 'ORD001', customer: 'PTG ปั๊มน้ำมัน สาขาบางนา', weight: 1250, cbm: 5.2, address: 'ถ.บางนา-ตราด กม.5', status: 'รอวางแผน', bu: 'BU-01', lat: 13.6649, lng: 100.6052 },
    { id: 'ORD002', customer: 'PTG ปั๊มน้ำมัน สาขารังสิต', weight: 890, cbm: 3.8, address: 'ถ.รังสิต-นครนายก', status: 'รอวางแผน', bu: 'BU-02', lat: 13.9640, lng: 100.5978 },
    { id: 'ORD003', customer: 'PTG ปั๊มน้ำมัน สาขาพระราม 2', weight: 2100, cbm: 8.5, address: 'ถ.พระราม 2 กม.15', status: 'รอวางแผน', bu: 'BU-01', lat: 13.6491, lng: 100.4329 },
    { id: 'ORD004', customer: 'PTG ปั๊มน้ำมัน สาขาลาดพร้าว', weight: 1560, cbm: 6.2, address: 'ถ.ลาดพร้าว 101', status: 'รอวางแผน', bu: 'BU-03', lat: 13.7944, lng: 100.6078 },
    { id: 'ORD005', customer: 'PTG ปั๊มน้ำมัน สาขาสุขุมวิท', weight: 980, cbm: 4.1, address: 'ถ.สุขุมวิท 71', status: 'รอวางแผน', bu: 'BU-02', lat: 13.7142, lng: 100.5879 },
  ]);
  // Vehicle types data
  const [vehicleTypes, setVehicleTypes] = useState([
    { id: 1, code: '4W', name: 'รถกระบะเล็ก (4 ล้อ)', maxWeight: 1500, maxCBM: 8, maxDestinations: 8, category: 'รถบรรทุก 4 ล้อ', costPerKm: 8.5, icon: '🚛' },
    { id: 2, code: '4WJ', name: 'รถกระบะจัมโบ้ (4 ล้อจัมโบ้)', maxWeight: 2800, maxCBM: 13, maxDestinations: 10, category: 'รถบรรทุก 4 ล้อ', costPerKm: 12.5, icon: '🚚' },
    { id: 3, code: '6W', name: 'รถบรรทุก 6 ล้อ', maxWeight: 5500, maxCBM: 35, maxDestinations: 15, category: 'รถบรรทุก 6 ล้อ', costPerKm: 18.5, icon: '🚛' },
    { id: 4, code: '10W', name: 'รถบรรทุก 10 ล้อ', maxWeight: 15000, maxCBM: 80, maxDestinations: 20, category: 'รถบรรทุก 10 ล้อ', costPerKm: 25.5, icon: '🚚' },
    { id: 5, code: 'REF', name: 'รถห้องเย็น (Reefer)', maxWeight: 8000, maxCBM: 45, maxDestinations: 12, category: 'รถควบคุมอุณหภูมิ', costPerKm: 22.5, icon: '❄️' },
  ]);
  // Drivers data
  const [drivers, setDrivers] = useState([
    { id: 'D001', name: 'สมชาย ทองดี', phone: '081-234-5678', licenseNo: 'ท.21', licenseExpiry: '15/10/2025', vehicleTypes: ['6W'], area: 'กรุงเทพฯ', company: 'ABC Logistic Co.,Ltd.', photo: null },
    { id: 'D002', name: 'สมศรี ใจดี', phone: '082-345-6789', licenseNo: 'ท.22', licenseExpiry: '20/11/2025', vehicleTypes: ['4W', '4WJ'], area: 'นนทบุรี', company: 'ABC Logistic Co.,Ltd.', photo: null },
  ]);
  // Trips data
  const [trips, setTrips] = useState([
    { 
      id: '6W001', 
      type: '6W', 
      branches: 2, 
      weight: 4827, 
      utilization: 80.5, 
      cost: 3605, 
      distance: 100, 
      branchList: [
        { name: 'ฉลองกรุง 3, FC ฉลองกรุง 3 (ปั๊ม PTG)_FC203, ฉลองกรุง3, ก.ฉลองกรุง3', weight: 2745.68, cbm: 9.19 },
        { name: 'ฉลองกรุง 2, ก.ฉลองกรุง 2, ก.ฉลองกรุง2, ก.ฉลองกรุง2', weight: 2081.82, cbm: 7.23 }
      ],
      costBreakdown: { fuel: 3605, perKm: 0.75 },
      timeBreakdown: { driving: 100, service: 49.5 },
      locations: [
        { lat: 13.6649, lng: 100.6052, name: 'สาขาบางนา' },
        { lat: 13.9640, lng: 100.5978, name: 'สาขารังสิต' }
      ]
    },
    { 
      id: '6W002', 
      type: '6W', 
      branches: 1, 
      weight: 3838, 
      utilization: 64.0, 
      cost: 3605, 
      distance: 115, 
      branchList: [
        { name: 'พหลโยธิน สาย 3, พหลโยธิน สาย 3, พหลโยธิน สาย3, พหลโยธิน สาย3', weight: 3837.5, cbm: 11.70 }
      ],
      costBreakdown: { fuel: 3605, perKm: 0.94 },
      timeBreakdown: { driving: 115, service: 115.0 },
      locations: [
        { lat: 13.8833, lng: 100.5744, name: 'สาขาพหลโยธิน' }
      ]
    },
  ]);
  // Delivery history data
  const [deliveryHistory, setDeliveryHistory] = useState([
    { date: '2024-01-15', trips: 12, orders: 45, totalWeight: 25800, totalCost: 45600, status: 'completed' },
    { date: '2024-01-14', trips: 10, orders: 38, totalWeight: 21500, totalCost: 38900, status: 'completed' },
    { date: '2024-01-13', trips: 8, orders: 32, totalWeight: 18200, totalCost: 32100, status: 'completed' },
  ]);
  const notifications = [
    { id: 1, type: 'new', message: 'มีออเดอร์ใหม่ 5 รายการรอการวางแผน', time: '5 นาทีที่แล้ว' },
    { id: 2, type: 'update', message: 'แผนการจัดส่ง 6W005 ถูกปรับเปลี่ยน', time: '15 นาทีที่แล้ว' },
    { id: 3, type: 'complete', message: 'การจัดส่ง 6W003 เสร็จสมบูรณ์', time: '1 ชั่วโมงที่แล้ว' }
  ];
  const vehicleCategories = [
    { name: 'รถบรรทุก 4 ล้อ', description: 'เช่น 4W, 4WJ (4 ล้อจัมโบ้)', icon: '🚛' },
    { name: 'รถบรรทุก 6 ล้อ', description: 'ใช้บ่อยในขนส่งสินค้าระดับกลาง', icon: '🚚' },
    { name: 'รถบรรทุก 10 ล้อ', description: 'สำหรับสินค้าหนัก ระยะไกล', icon: '🚛' },
    { name: 'รถเทรลเลอร์ / หัวลาก (18 ล้อ)', description: 'สำหรับตู้คอนเทนเนอร์หรือขนสินค้าหนักมาก', icon: '🚚' },
    { name: 'รถควบคุมอุณหภูมิ', description: 'รถตู้เย็น ใช้ขนสินค้าที่ต้องรักษาอุณหภูมิ เช่น อาหาร', icon: '❄️' },
    { name: 'รถตู้ (Van)', description: 'บรรทุกคนหรือของ', icon: '🚐' },
  ];
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            alert(`อัพโหลดไฟล์ ${file.name} เสร็จสมบูรณ์!`);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };
  const runRouteOptimization = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      setIsOptimizing(false);
      alert('การวางแผนเส้นทางเสร็จสมบูรณ์!');
    }, 3000);
  };
  const handleAddVehicleType = (newVehicle) => {
    const newId = Math.max(...vehicleTypes.map(v => v.id)) + 1;
    setVehicleTypes([...vehicleTypes, { ...newVehicle, id: newId }]);
    setShowAddVehicleForm(false);
  };
  const handleAddDriver = (newDriver) => {
    const newId = 'D' + String(drivers.length + 1).padStart(3, '0');
    setDrivers([...drivers, { ...newDriver, id: newId }]);
    setShowAddDriverForm(false);
  };
  const handleDragStart = (e, trip) => {
    setDraggedTrip(trip);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e, targetTrip) => {
    e.preventDefault();
    if (draggedTrip && draggedTrip.id !== targetTrip.id) {
      // Merge trips logic here
      alert(`รวมทริป ${draggedTrip.id} กับ ${targetTrip.id}`);
    }
    setDraggedTrip(null);
  };
  const handleBranchDragStart = (e, branch, tripId) => {
    setDraggedBranch(branch);
    setDraggedFromTrip(tripId);
    setDragMethod('drag');
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleBranchDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleBranchDrop = (e, targetBranch, targetTripId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedBranch && draggedFromTrip && dragMethod === 'drag') {
      if (draggedFromTrip === targetTripId) {
        // Reordering within same trip - no confirmation needed
        const updatedTrips = [...trips];
        const sourceTrip = updatedTrips.find(trip => trip.id === draggedFromTrip);
        
        if (sourceTrip) {
          const branches = [...sourceTrip.branchList];
          const draggedIndex = branches.findIndex(branch => branch.name === draggedBranch.name);
          
          if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
            const [movedBranch] = branches.splice(draggedIndex, 1);
            branches.splice(targetIndex, 0, movedBranch);
            
            sourceTrip.branchList = branches;
            setTrips(updatedTrips);
          }
        }
      } else {
        // Moving between different trips - need confirmation
        setDropTarget({ targetTripId, targetIndex, branch: draggedBranch, fromTripId: draggedFromTrip });
        setShowDropConfirm(true);
      }
    }
    
    setDraggedBranch(null);
    setDraggedFromTrip(null);
    setDragMethod(null);
  };
  const handleQuickMove = (branch, fromTripId) => {
    setSelectedBranchToMove({ branch, fromTripId });
    setShowQuickMoveModal(true);
  };
  const handleSingleClickDrag = (branch, fromTripId) => {
    if (selectedForDrag && selectedForDrag.branch.name === branch.name && selectedForDrag.fromTripId === fromTripId) {
      // Unselect if clicking the same branch
      setSelectedForDrag(null);
    } else {
      // Select branch for dragging
      setSelectedForDrag({ branch, fromTripId });
      setDragMethod('click');
    }
  };
  const handleTripClickDrop = (targetTripId) => {
    if (selectedForDrag && selectedForDrag.fromTripId !== targetTripId) {
      setDropTarget({ targetTripId, targetIndex: null, branch: selectedForDrag.branch, fromTripId: selectedForDrag.fromTripId });
      setShowDropConfirm(true);
    }
  };
  const confirmDrop = () => {
    if (dropTarget) {
      const { branch, fromTripId, targetTripId, targetIndex } = dropTarget;
      
      // Execute the move
      const updatedTrips = [...trips];
      const sourceTrip = updatedTrips.find(trip => trip.id === fromTripId);
      const targetTrip = updatedTrips.find(trip => trip.id === targetTripId);
      
      if (sourceTrip && targetTrip) {
        const sourceBranches = [...sourceTrip.branchList];
        const targetBranches = [...targetTrip.branchList];
        
        // Remove from source trip
        const draggedIndex = sourceBranches.findIndex(b => b.name === branch.name);
        if (draggedIndex !== -1) {
          sourceBranches.splice(draggedIndex, 1);
          
          // Add to target trip
          const insertIndex = targetIndex !== null ? targetIndex : targetBranches.length;
          targetBranches.splice(insertIndex, 0, branch);
          
          sourceTrip.branchList = sourceBranches;
          targetTrip.branchList = targetBranches;
          
          // Update branch counts
          sourceTrip.branches = sourceBranches.length;
          targetTrip.branches = targetBranches.length;
          
          // Recalculate weights
          sourceTrip.weight = sourceBranches.reduce((sum, b) => sum + b.weight, 0);
          targetTrip.weight = targetBranches.reduce((sum, b) => sum + b.weight, 0);
          
          setTrips(updatedTrips);
        }
      }
      
      // Reset states
      setSelectedForDrag(null);
      setShowDropConfirm(false);
      setDropTarget(null);
      setDragMethod(null);
      setDraggedBranch(null);
      setDraggedFromTrip(null);
    }
  };
  const cancelDrop = () => {
    setShowDropConfirm(false);
    setDropTarget(null);
    // Reset drag states but keep selection if it was click method
    if (dragMethod !== 'click') {
      setDraggedBranch(null);
      setDraggedFromTrip(null);
    }
  };
  const exportDeliveryData = (date) => {
    const data = deliveryHistory.find(h => h.date === date);
    if (data) {
      // Create CSV content
      const csv = `Date,Trips,Orders,Total Weight,Total Cost\n${data.date},${data.trips},${data.orders},${data.totalWeight},${data.totalCost}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery_${data.date}.csv`;
      a.click();
    }
  };
  // Driver-adz Logo Component
  const DriverAdzLogo = () => (
    <svg width="40" height="40" viewBox="0 0 200 200" className="mr-3">
      <circle cx="100" cy="100" r="90" fill="#000000" />
      <circle cx="40" cy="100" r="8" fill="#20B2AA" />
      <circle cx="50" cy="75" r="6" fill="#20B2AA" />
      <circle cx="50" cy="125" r="6" fill="#20B2AA" />
      <circle cx="60" cy="55" r="5" fill="#20B2AA" />
      <circle cx="60" cy="145" r="5" fill="#20B2AA" />
      <circle cx="70" cy="40" r="4" fill="#20B2AA" />
      <circle cx="70" cy="160" r="4" fill="#20B2AA" />
      <g transform="translate(100, 100)">
        <path d="M -20,-30 L 0,0 L 20,-30" stroke="#20B2AA" strokeWidth="3" fill="none" />
        <path d="M -30,0 L 0,0 L 30,0" stroke="#20B2AA" strokeWidth="3" fill="none" />
        <path d="M -20,30 L 0,0 L 20,30" stroke="#20B2AA" strokeWidth="3" fill="none" />
        <path d="M -30,-20 Q -10,-10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
        <path d="M 30,-20 Q 10,-10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
        <path d="M -30,20 Q -10,10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
        <path d="M 30,20 Q 10,10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
        <circle cx="0" cy="0" r="8" fill="#20B2AA" />
        <circle cx="-20" cy="-30" r="6" fill="#20B2AA" />
        <circle cx="20" cy="-30" r="6" fill="#20B2AA" />
        <circle cx="-30" cy="0" r="6" fill="#20B2AA" />
        <circle cx="30" cy="0" r="6" fill="#20B2AA" />
        <circle cx="-20" cy="30" r="6" fill="#20B2AA" />
        <circle cx="20" cy="30" r="6" fill="#20B2AA" />
        <circle cx="-30" cy="-20" r="5" fill="#20B2AA" />
        <circle cx="30" cy="-20" r="5" fill="#20B2AA" />
        <circle cx="-30" cy="20" r="5" fill="#20B2AA" />
        <circle cx="30" cy="20" r="5" fill="#20B2AA" />
      </g>
    </svg>
  );
  // Trip Card Component with enhanced design
  const TripCard = ({ 
    trip, 
    draggedBranch, 
    draggedFromTrip, 
    handleBranchDragStart, 
    handleBranchDragOver, 
    handleBranchDrop, 
    setTrips, 
    trips,
    handleQuickMove,
    selectedForDrag,
    handleSingleClickDrag,
    handleTripClickDrop,
    hoveredTrip,
    setHoveredTrip
  }) => {
    const isDropTarget = selectedForDrag && selectedForDrag.fromTripId !== trip.id;
    const isHovered = hoveredTrip === trip.id;
    
    const getUtilizationColor = (util) => {
      if (util >= 90) return '#03A477';
      if (util >= 70) return '#FFA726';
      return '#EF5350';
    };
    const getUtilizationBar = (util) => {
      const color = getUtilizationColor(util);
      return (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${util}%`, backgroundColor: color }}
          />
        </div>
      );
    };
    return (
      <div 
        className={`bg-white rounded-xl shadow-lg border-2 p-5 hover:shadow-xl transition-all ${
          draggedBranch && draggedFromTrip === trip.id 
            ? 'border-blue-400 bg-blue-50' 
            : draggedBranch && draggedFromTrip !== trip.id
            ? 'border-green-400 bg-green-50 animate-pulse'
            : isDropTarget && isHovered
            ? 'border-purple-500 bg-purple-50 shadow-2xl transform scale-105'
            : isDropTarget
            ? 'border-purple-300 cursor-pointer'
            : 'border-gray-100'
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, trip)}
        onDragOver={(e) => {
          handleDragOver(e);
          handleBranchDragOver(e);
        }}
        onDrop={(e) => {
          // Handle both trip and branch drops
          if (draggedBranch && draggedFromTrip !== trip.id) {
            handleBranchDrop(e, null, trip.id, trip.branchList.length);
          } else {
            handleDrop(e, trip);
          }
        }}
        onMouseEnter={() => setHoveredTrip(trip.id)}
        onMouseLeave={() => setHoveredTrip(null)}
      >
        <div className="flex justify-between items-start mb-4">
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => {
              if (selectedForDrag && selectedForDrag.fromTripId !== trip.id) {
                handleTripClickDrop(trip.id);
              }
            }}
          >
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg font-bold text-lg">
              {trip.id}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium">
              {trip.type}
            </div>
            {draggedBranch && draggedFromTrip !== trip.id && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium animate-pulse">
                <Hand className="w-3 h-3 inline mr-1" />
                วางที่นี่
              </div>
            )}
            {isDropTarget && (
              <div className={`px-2 py-1 rounded-lg text-xs font-medium animate-bounce ${
                isHovered 
                  ? 'bg-purple-200 text-purple-800' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                <MousePointer className="w-3 h-3 inline mr-1" />
                {isHovered ? 'วางที่นี่!' : 'คลิกเพื่อย้าย'}
              </div>
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Copy className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center hover:bg-green-100 transition-colors">
            <p className="text-2xl font-bold text-green-600">{trip.branches}</p>
            <p className="text-xs text-gray-600 mt-1">สาขา</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center hover:bg-blue-100 transition-colors">
            <p className="text-2xl font-bold text-blue-600">{trip.weight.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">kg</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center hover:bg-purple-100 transition-colors">
            <p className="text-2xl font-bold text-purple-600">{trip.utilization}%</p>
            <p className="text-xs text-gray-600 mt-1">ใช้ประโยชน์</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center hover:bg-orange-100 transition-colors">
            <p className="text-2xl font-bold text-orange-600">{trip.cost.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">บาท</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 text-center hover:bg-indigo-100 transition-colors">
            <p className="text-2xl font-bold text-indigo-600">{trip.distance}</p>
            <p className="text-xs text-gray-600 mt-1">กม.</p>
          </div>
        </div>
        {getUtilizationBar(trip.utilization)}
        <div className="flex items-center gap-2 mt-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Driving Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-yellow-50 rounded-lg p-3 hover:bg-yellow-100 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-gray-700">ต้นทุนรวม:</span>
            </div>
            <p className="text-lg font-bold text-yellow-700">{trip.cost.toLocaleString()} บาท</p>
            <p className="text-xs text-gray-600">({trip.costBreakdown.perKm} บาท/กม.)</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">ระยะทางรวม:</span>
            </div>
            <p className="text-lg font-bold text-blue-700">{trip.distance} กม.</p>
            <p className="text-xs text-gray-600">({trip.timeBreakdown.driving} กม./สาขา)</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            สาขาในทริป (ลากเพื่อเรียงลำดับ):
          </p>
          {trip.branchList.map((branch, idx) => (
            <div 
              key={`${branch.name}-${idx}`} 
              className={`bg-gray-50 rounded-lg p-3 mb-2 border-2 transition-all hover:shadow-md ${
                draggedBranch && draggedBranch.name === branch.name 
                  ? 'opacity-50 border-blue-400 bg-blue-50' 
                  : selectedForDrag && selectedForDrag.branch.name === branch.name && selectedForDrag.fromTripId === trip.id
                  ? 'border-purple-500 bg-purple-100 shadow-lg transform scale-105'
                  : 'border-transparent hover:border-gray-300'
              }`}
              draggable
              onDragStart={(e) => handleBranchDragStart(e, branch, trip.id)}
              onDragOver={handleBranchDragOver}
              onDrop={(e) => handleBranchDrop(e, branch, trip.id, idx)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <button
                    onClick={() => handleSingleClickDrag(branch, trip.id)}
                    className={`p-2 rounded-lg transition-all ${
                      selectedForDrag && selectedForDrag.branch.name === branch.name && selectedForDrag.fromTripId === trip.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-100'
                    }`}
                    title={selectedForDrag && selectedForDrag.branch.name === branch.name && selectedForDrag.fromTripId === trip.id 
                      ? 'คลิกเพื่อยกเลิกการเลือก' 
                      : 'คลิกเพื่อเลือกสำหรับย้าย'}
                  >
                    <MousePointer className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-xs text-gray-500">ลำดับการจัดส่ง</span>
                    {selectedForDrag && selectedForDrag.branch.name === branch.name && selectedForDrag.fromTripId === trip.id && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                        ✨ เลือกแล้ว - คลิกทริปปลายทาง
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{branch.name}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {branch.weight.toLocaleString()} kg
                    </span>
                    <span className="text-orange-600 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {branch.cbm} CBM
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-1">
                  <div className="flex gap-1">
                    <button 
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickMove(branch, trip.id);
                      }}
                      title="เลือกทริปจากรายการ"
                    >
                      <Route className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveBranch(branch, trip.id);
                      }}
                      title="พิมพ์รหัสทริปปลายทาง"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`แก้ไขข้อมูลสาขา: ${branch.name}`);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`ต้องการลบสาขา ${branch.name} ออกจากทริปนี้?`)) {
                          const updatedTrips = trips.map(t => {
                            if (t.id === trip.id) {
                              const newBranchList = t.branchList.filter((_, i) => i !== idx);
                              return {
                                ...t,
                                branchList: newBranchList,
                                branches: newBranchList.length,
                                weight: newBranchList.reduce((sum, b) => sum + b.weight, 0)
                              };
                            }
                            return t;
                          });
                          setTrips(updatedTrips);
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            ดูรายละเอียด
          </button>
          <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" />
            วิเคราะห์ต้นทุน
          </button>
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium flex items-center justify-center gap-2">
            <Route className="w-4 h-4" />
            วิเคราะห์ระยะทาง
          </button>
        </div>
      </div>
    );
  };
  // Enhanced Drop Confirmation Modal
  const DropConfirmModal = () => {
    if (!showDropConfirm || !dropTarget) return null;
    
    const { branch, fromTripId, targetTripId } = dropTarget;
    const sourceTrip = trips.find(t => t.id === fromTripId);
    const targetTrip = trips.find(t => t.id === targetTripId);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform scale-100 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-2xl shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">ยืนยันการย้ายสาขา</h3>
              <p className="text-sm text-gray-600 mt-1">คุณต้องการย้ายสาขานี้หรือไม่?</p>
            </div>
          </div>
          <div className="mb-6 space-y-4">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <p className="text-sm text-blue-600 mb-2 font-medium">สาขาที่ต้องการย้าย:</p>
              <p className="font-bold text-blue-800 text-lg">{branch.name}</p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-lg">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {branch.weight.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-lg">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    {branch.cbm} CBM
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 shadow-lg animate-bounce">
                <Navigation className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
                <p className="text-xs text-red-600 mb-1 font-medium">จาก:</p>
                <p className="font-bold text-red-700 text-lg">{fromTripId}</p>
                {sourceTrip && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-red-600">
                      คงเหลือ: {sourceTrip.branches - 1} สาขา
                    </p>
                    <p className="text-xs text-red-600">
                      น้ำหนัก: {(sourceTrip.weight - branch.weight).toLocaleString()} kg
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <p className="text-xs text-green-600 mb-1 font-medium">ไปยัง:</p>
                <p className="font-bold text-green-700 text-lg">{targetTripId}</p>
                {targetTrip && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-600">
                      จะมี: {targetTrip.branches + 1} สาขา
                    </p>
                    <p className="text-xs text-green-600">
                      น้ำหนัก: {(targetTrip.weight + branch.weight).toLocaleString()} kg
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={confirmDrop}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              ใช่ ย้ายเลย
            </button>
            <button
              onClick={cancelDrop}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              ไม่ ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Quick Move Modal Component
  const QuickMoveModal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    if (!showQuickMoveModal || !selectedBranchToMove) return null;
    
    const { branch, fromTripId } = selectedBranchToMove;
    const availableTrips = trips.filter(trip => trip.id !== fromTripId);
    
    // Filter trips based on search
    const filteredTrips = availableTrips.filter(trip => 
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.branchList.some(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
              <Route className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">เลือกทริปปลายทาง</h3>
              <p className="text-sm text-gray-600 mt-1">คลิกเลือกทริปที่ต้องการย้ายไป</p>
            </div>
          </div>
          <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
            <p className="text-sm text-purple-600 mb-2 font-medium">สาขาที่ต้องการย้าย:</p>
            <p className="font-bold text-purple-800 text-lg">{branch.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-purple-600">
                จากทริป: <span className="font-bold text-purple-700">{fromTripId}</span>
              </span>
              <span className="text-sm text-purple-600">•</span>
              <span className="text-sm text-purple-600">
                {branch.weight.toLocaleString()} kg
              </span>
              <span className="text-sm text-purple-600">•</span>
              <span className="text-sm text-purple-600">
                {branch.cbm} CBM
              </span>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              เลือกทริปปลายทาง:
            </p>
            
            {/* Search Box */}
            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาทริป (รหัสทริป, ประเภทรถ, สาขา)..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {filteredTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">ไม่พบทริปที่ค้นหา</p>
                </div>
              ) : (
                filteredTrips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      // Show confirmation modal
                      setDropTarget({ targetTripId: trip.id, targetIndex: null, branch, fromTripId });
                      setShowDropConfirm(true);
                      setShowQuickMoveModal(false);
                      setSelectedBranchToMove(null);
                      setSearchTerm('');
                    }}
                    className="p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all text-left group transform hover:scale-102"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg text-gray-800 group-hover:text-purple-700">
                          {trip.id}
                        </p>
                        <p className="text-sm text-gray-600 group-hover:text-purple-600">
                          {trip.branches} สาขา | {trip.weight.toLocaleString()} kg | {trip.type}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                            การใช้ประโยชน์: {trip.utilization}%
                          </span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                            ต้นทุน: {trip.cost.toLocaleString()} บาท
                          </span>
                        </div>
                      </div>
                      <div className="text-purple-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all">
                        <Route className="w-6 h-6" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowQuickMoveModal(false);
                setSelectedBranchToMove(null);
                setSearchTerm('');
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Add Vehicle Form Component
  const AddVehicleForm = () => {
    const [formData, setFormData] = useState({
      code: '',
      name: '',
      maxWeight: '',
      maxCBM: '',
      maxDestinations: '',
      category: '',
      costPerKm: '',
      icon: '🚛'
    });
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#20B2AA] to-[#48D1CC] p-3 rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">เพิ่มประเภทรถใหม่</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสรถ</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20B2AA] focus:border-transparent transition-all"
                placeholder="เช่น 10W, TRAILER"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อประเภทรถ</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                placeholder="เช่น รถบรรทุก 10 ล้อ"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
              <div className="grid grid-cols-3 gap-3">
                {vehicleCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFormData({...formData, category: cat.name})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.category === cat.name 
                        ? 'border-[#20B2AA] bg-[#20B2AA] bg-opacity-10' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <p className="text-xs font-medium">{cat.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">น้ำหนักสูงสุด (kg)</label>
              <input
                type="number"
                value={formData.maxWeight}
                onChange={(e) => setFormData({...formData, maxWeight: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ปริมาตร (CBM)</label>
              <input
                type="number"
                value={formData.maxCBM}
                onChange={(e) => setFormData({...formData, maxCBM: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จุดส่งสูงสุด</label>
              <input
                type="number"
                value={formData.maxDestinations}
                onChange={(e) => setFormData({...formData, maxDestinations: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ต้นทุนต่อกิโลเมตร (บาท)</label>
              <input
                type="number"
                value={formData.costPerKm}
                onChange={(e) => setFormData({...formData, costPerKm: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => handleAddVehicleType(formData)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
            >
              บันทึกข้อมูล
            </button>
            <button
              onClick={() => setShowAddVehicleForm(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Add Driver Form Component
  const AddDriverForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      licenseNo: '',
      licenseExpiry: '',
      vehicleTypes: [],
      area: '',
      company: '',
      photo: null,
      startDate: '',
      licenseType: '',
      productTypes: []
    });
    const licenseTypes = ['ท.1', 'ท.2', 'ท.3', 'ท.4'];
    const productTypes = ['สินค้าทั่วไป', 'สินค้าอันตราย', 'สินค้าควบคุมอุณหภูมิ', 'น้ำมัน', 'เคมีภัณฑ์'];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#20B2AA] to-[#48D1CC] p-3 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">เพิ่มข้อมูลคนขับ</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex justify-center mb-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Driver" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <input
                  ref={driverPhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, photo: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => driverPhotoRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#20B2AA] text-white p-2 rounded-full hover:bg-[#48D1CC] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                placeholder="เช่น สมชาย ทองดี"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                placeholder="081-234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทใบขับขี่</label>
              <select
                value={formData.licenseType}
                onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              >
                <option value="">เลือกประเภทใบขับขี่</option>
                {licenseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เลขใบขับขี่</label>
              <input
                type="text"
                value={formData.licenseNo}
                onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                placeholder="ท.21/12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันหมดอายุใบขับขี่</label>
              <input
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันเริ่มงาน</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทรถที่ขับได้</label>
              <div className="flex flex-wrap gap-2">
                {vehicleTypes.map(vehicle => (
                  <label key={vehicle.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vehicleTypes.includes(vehicle.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, vehicleTypes: [...formData.vehicleTypes, vehicle.code]});
                        } else {
                          setFormData({...formData, vehicleTypes: formData.vehicleTypes.filter(v => v !== vehicle.code)});
                        }
                      }}
                      className="w-4 h-4 text-[#20B2AA] focus:ring-[#20B2AA]"
                    />
                    <span className="text-sm">{vehicle.code}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทสินค้าที่ขนส่งได้</label>
              <div className="flex flex-wrap gap-2">
                {productTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.productTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, productTypes: [...formData.productTypes, type]});
                        } else {
                          setFormData({...formData, productTypes: formData.productTypes.filter(t => t !== type)});
                        }
                      }}
                      className="w-4 h-4 text-[#029D84] focus:ring-[#029D84]"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">พื้นที่รับผิดชอบ</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                placeholder="เช่น กรุงเทพฯ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">บริษัทต้นสังกัด</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                placeholder="ABC Logistic Co.,Ltd."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => handleAddDriver(formData)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#029D84] to-[#03A477] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
            >
              บันทึกข้อมูล
            </button>
            <button
              onClick={() => setShowAddDriverForm(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DriverAdzLogo />
              <div>
                <h1 className="text-xl font-semibold" style={{ color: '#20B2AA' }}>Driver-adz</h1>
                <p className="text-xs text-gray-500">ระบบวางแผนเส้นทาง PTG Enhanced</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'orders', label: 'ออเดอร์', icon: FileSpreadsheet },
              { id: 'planning', label: 'วางแผนเส้นทาง', icon: MapPin },
              { id: 'fleet', label: 'จัดการยานพาหนะ', icon: Truck },
              { id: 'drivers', label: 'จัดการคนขับ', icon: Users },
              { id: 'history', label: 'ประวัติการจัดส่ง', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-[#20B2AA] text-[#20B2AA]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">จัดการออเดอร์</h2>
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="relative">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold text-xl shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold">อัปโหลดข้อมูล</div>
                      <div className="text-xs opacity-90">คลิกเพื่อเลือกไฟล์ Excel/CSV</div>
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      </span>
                    </div>
                  </button>
                </div>
                <button className="flex items-center gap-3 px-6 py-4 bg-white border-3 border-gray-900 text-gray-900 rounded-2xl hover:bg-gray-900 hover:text-white transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Download className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">ดาวน์โหลดเทมเพลต</div>
                    <div className="text-xs">ไฟล์ตัวอย่าง Excel</div>
                  </div>
                </button>
              </div>
            </div>
            {/* Upload Helper with Arrow */}
            <div className="mb-6 relative">
              <div className="absolute -top-8 right-48 text-gray-900 animate-bounce hidden lg:block">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <path d="M 50 10 Q 70 30 60 50" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <polygon points="55,48 65,50 58,58" fill="currentColor"/>
                </svg>
                <div className="absolute top-0 right-20 font-bold text-lg whitespace-nowrap">
                  เริ่มต้นที่นี่!
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">วิธีการใช้งาน</h3>
                    <p className="text-sm text-blue-700">
                      1. คลิกปุ่ม "ดาวน์โหลดเทมเพลต" เพื่อดาวน์โหลดไฟล์ตัวอย่าง<br/>
                      2. กรอกข้อมูลออเดอร์ในไฟล์ Excel/CSV<br/>
                      3. คลิกปุ่ม "อัปโหลดข้อมูล" เพื่อนำเข้าข้อมูลเข้าสู่ระบบ
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4 bg-white rounded-xl shadow-lg border-2 border-gray-900 p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-gray-900" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">กำลังอัปโหลดไฟล์...</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{uploadProgress}%</span>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        รหัสออเดอร์
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ชื่อลูกค้า/สาขา
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        BU
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        น้ำหนัก (kg)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        CBM
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ที่อยู่
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                            {order.bu}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {order.weight.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {order.cbm}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#20B2AA] hover:text-[#48D1CC] mr-3 transform hover:scale-110 transition-all">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-700 transform hover:scale-110 transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Planning Tab */}
        {activeTab === 'planning' && (
          <>
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">วางแผนเส้นทาง</h2>
              <button 
                onClick={runRouteOptimization}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold text-xl shadow-xl hover:from-teal-600 hover:to-cyan-600 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Play className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold">รันวางแผนด้วย AI</div>
                  <div className="text-xs opacity-90">คลิกเพื่อเริ่มการวิเคราะห์</div>
                </div>
              </button>
            </div>
            {/* Map */}
            <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden">
              <div id="map" className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-2" />
                  <p>แผนที่จะแสดงที่นี่เมื่อเชื่อมต่อ Google Maps API</p>
                </div>
              </div>
            </div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">จำนวนทริปทั้งหมด</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{trips.length}</p>
                  </div>
                  <Truck className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">การใช้ประโยชน์เฉลี่ย</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      {trips.length > 0 ? (trips.reduce((sum, trip) => sum + trip.utilization, 0) / trips.length).toFixed(1) : 0}%
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ต้นทุนรวม (บาท)</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">
                      {trips.reduce((sum, trip) => sum + trip.cost, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ระยะทางรวม (กม.)</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                      {trips.reduce((sum, trip) => sum + trip.distance, 0)}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">สาขารวม</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">
                      {trips.reduce((sum, trip) => sum + trip.branches, 0)}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">น้ำหนักรวม (ตัน)</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">
                      {(trips.reduce((sum, trip) => sum + trip.weight, 0) / 1000).toFixed(1)}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
            </div>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 text-[#20B2AA]" />
                    Filter Vehicle Type:
                  </label>
                  <select 
                    value={selectedVehicleType}
                    onChange={(e) => setSelectedVehicleType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                  >
                    <option>ทุกประเภทรถ</option>
                    {vehicleTypes.map(v => (
                      <option key={v.id} value={v.code}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Filter className="w-4 h-4 text-[#20B2AA]" />
                    Filter Status:
                  </label>
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                  >
                    <option>ทุกสถานะ</option>
                    <option>เสร็จสิ้น</option>
                    <option>กำลังดำเนินการ</option>
                    <option>รอดำเนินการ</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 text-[#20B2AA]" />
                    Filter by Cost Range:
                  </label>
                  <select 
                    value={selectedCostRange}
                    onChange={(e) => setSelectedCostRange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                  >
                    <option>ทุกช่วงต้นทุน</option>
                    <option>0-2,000 บาท</option>
                    <option>2,000-5,000 บาท</option>
                    <option>5,000-10,000 บาท</option>
                    <option>10,000+ บาท</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-[#20B2AA]" />
                    Filter by Distance Range:
                  </label>
                  <select 
                    value={selectedDistanceRange}
                    onChange={(e) => setSelectedDistanceRange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent transition-all"
                  >
                    <option>ทุกช่วงระยะทาง</option>
                    <option>0-50 กม.</option>
                    <option>50-150 กม.</option>
                    <option>150-300 กม.</option>
                    <option>300+ กม.</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Settings className="w-4 h-4 text-[#20B2AA]" />
                    Quick Actions:
                  </label>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium">
                      รายละเอียดต้นทุน
                    </button>
                    <button className="flex-1 px-3 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium">
                      วิเคราะห์ระยะทาง
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Enhanced Instructions for Drag and Drop */}
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 shadow-lg">
                  <MousePointer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 mb-2 text-lg">การใช้งาน Click & Drop และการย้ายสาขา (อัพเดทใหม่!)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                      <p className="text-sm text-purple-800 font-medium mb-1">🖱️ วิธีที่ 1: คลิกเดี่ยว (ใหม่!)</p>
                      <p className="text-xs text-purple-700">
                        1. คลิกปุ่ม <MousePointer className="w-3 h-3 inline" /> ที่สาขาเพื่อเลือก<br/>
                        2. คลิกที่ทริปปลายทางที่ต้องการ<br/>
                        3. ยืนยันการย้ายใน popup Yes/No
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                      <p className="text-sm text-purple-800 font-medium mb-1">🔄 วิธีที่ 2: ลากและวาง</p>
                      <p className="text-xs text-purple-700">
                        • ลากสาขาไปวางในทริปอื่น<br/>
                        • ลากเพื่อเรียงลำดับในทริปเดียวกัน<br/>
                        • ลากทริปเพื่อรวมทริป
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                      <p className="text-sm text-purple-800 font-medium mb-1">⚡ วิธีที่ 3: ปุ่มด่วน</p>
                      <p className="text-xs text-purple-700">
                        • <Route className="w-3 h-3 inline" /> เลือกทริปจากรายการ<br/>
                        • <Navigation className="w-3 h-3 inline" /> พิมพ์รหัสทริปปลายทาง
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                      <p className="text-sm text-purple-800 font-medium mb-1">💡 เคล็ดลับ</p>
                      <p className="text-xs text-purple-700">
                        • สาขาที่เลือกจะมีสีม่วง<br/>
                        • ทริปที่สามารถวางได้จะขยายใหญ่
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  draggedBranch={draggedBranch}
                  draggedFromTrip={draggedFromTrip}
                  handleBranchDragStart={handleBranchDragStart}
                  handleBranchDragOver={handleBranchDragOver}
                  handleBranchDrop={handleBranchDrop}
                  setTrips={setTrips}
                  trips={trips}
                  handleQuickMove={handleQuickMove}
                  selectedForDrag={selectedForDrag}
                  handleSingleClickDrag={handleSingleClickDrag}
                  handleTripClickDrop={handleTripClickDrop}
                  hoveredTrip={hoveredTrip}
                  setHoveredTrip={setHoveredTrip}
                />
              ))}
            </div>
          </>
        )}
        {/* Fleet Management Tab */}
        {activeTab === 'fleet' && (
          <>
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">จัดการยานพาหนะ</h2>
              <button 
                onClick={() => setShowAddVehicleForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold shadow-lg"
              >
                <Plus className="w-6 h-6" />
                เพิ่มประเภทรถใหม่
              </button>
            </div>
            {/* Vehicle Categories Grid */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicleCategories.map((category, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg mb-2">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Vehicle Types Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] px-6 py-4">
                <h3 className="text-lg font-bold text-white">ประเภทรถที่ลงทะเบียน</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        รหัส
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ชื่อประเภทรถ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        หมวดหมู่
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        น้ำหนักสูงสุด (kg)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ปริมาตร (CBM)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        จุดส่งสูงสุด
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ต้นทุน/กม.
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicleTypes.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{vehicle.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{vehicle.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                            {vehicle.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.maxWeight.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.maxCBM}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.maxDestinations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ฿{vehicle.costPerKm}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#20B2AA] hover:text-[#48D1CC] mr-3 transform hover:scale-110 transition-all">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-700 transform hover:scale-110 transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <>
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">จัดการคนขับ</h2>
              <button 
                onClick={() => setShowAddDriverForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold shadow-lg"
              >
                <Plus className="w-6 h-6" />
                เพิ่มคนขับใหม่
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full overflow-hidden">
                        {driver.photo ? (
                          <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-white">
                        <h3 className="font-bold text-lg">{driver.name}</h3>
                        <p className="text-sm opacity-90">{driver.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{driver.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">ใบขับขี่: {driver.licenseNo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">หมดอายุ: {driver.licenseExpiry}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {driver.vehicleTypes.map((type) => (
                            <span key={type} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{driver.area}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600">{driver.company}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-[#20B2AA] text-white rounded-lg hover:bg-[#48D1CC] transition-colors text-sm font-medium">
                      แก้ไข
                    </button>
                    <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">ประวัติการจัดส่ง</h2>
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={selectedDate.toISOString().substring(0, 7)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#029D84] focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryHistory.map((history) => (
                <div key={history.date} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                  <div className="bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-6 h-6" />
                        <h3 className="font-bold text-lg">{new Date(history.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                      </div>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#20B2AA]">{history.trips}</p>
                        <p className="text-sm text-gray-600">ทริป</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{history.orders}</p>
                        <p className="text-sm text-gray-600">ออเดอร์</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{history.totalWeight.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">น้ำหนัก (kg)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">฿{history.totalCost.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">ต้นทุนรวม</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2 group-hover:bg-[#20B2AA] group-hover:text-white">
                        <Eye className="w-4 h-4" />
                        ดูรายละเอียด
                      </button>
                      <button 
                        onClick={() => exportDeliveryData(history.date)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2 group-hover:bg-orange-500 group-hover:text-white"
                      >
                        <FileDown className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      {/* Add Vehicle Form */}
      {showAddVehicleForm && <AddVehicleForm />}
      {/* Add Driver Form */}
      {showAddDriverForm && <AddDriverForm />}
      {/* Quick Move Modal */}
      <QuickMoveModal />
      {/* Drop Confirmation Modal */}
      <DropConfirmModal />
      {/* Loading Overlay */}
      {isOptimizing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl">
            <div className="animate-pulse">
              <svg width="120" height="120" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="#000000" />
                <circle cx="40" cy="100" r="8" fill="#20B2AA" className="animate-ping" />
                <circle cx="50" cy="75" r="6" fill="#20B2AA" opacity="0.8" />
                <circle cx="50" cy="125" r="6" fill="#20B2AA" opacity="0.8" />
                <circle cx="60" cy="55" r="5" fill="#20B2AA" opacity="0.6" />
                <circle cx="60" cy="145" r="5" fill="#20B2AA" opacity="0.6" />
                <circle cx="70" cy="40" r="4" fill="#20B2AA" opacity="0.4" />
                <circle cx="70" cy="160" r="4" fill="#20B2AA" opacity="0.4" />
                <g transform="translate(100, 100)">
                  <path d="M -20,-30 L 0,0 L 20,-30" stroke="#20B2AA" strokeWidth="3" fill="none" />
                  <path d="M -30,0 L 0,0 L 30,0" stroke="#20B2AA" strokeWidth="3" fill="none" />
                  <path d="M -20,30 L 0,0 L 20,30" stroke="#20B2AA" strokeWidth="3" fill="none" />
                  <path d="M -30,-20 Q -10,-10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
                  <path d="M 30,-20 Q 10,-10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
                  <path d="M -30,20 Q -10,10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
                  <path d="M 30,20 Q 10,10 0,0" stroke="#20B2AA" strokeWidth="2" fill="none" />
                  <circle cx="0" cy="0" r="8" fill="#20B2AA" />
                  <circle cx="-20" cy="-30" r="6" fill="#20B2AA" />
                  <circle cx="20" cy="-30" r="6" fill="#20B2AA" />
                  <circle cx="-30" cy="0" r="6" fill="#20B2AA" />
                  <circle cx="30" cy="0" r="6" fill="#20B2AA" />
                  <circle cx="-20" cy="30" r="6" fill="#20B2AA" />
                  <circle cx="20" cy="30" r="6" fill="#20B2AA" />
                  <circle cx="-30" cy="-20" r="5" fill="#20B2AA" />
                  <circle cx="30" cy="-20" r="5" fill="#20B2AA" />
                  <circle cx="-30" cy="20" r="5" fill="#20B2AA" />
                  <circle cx="30" cy="20" r="5" fill="#20B2AA" />
                </g>
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold" style={{ color: '#20B2AA' }}>Driver-adz</h3>
            <p className="mt-2 text-gray-600">กำลังวิเคราะห์และวางแผนเส้นทางด้วย AI...</p>
            <div className="mt-4 w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-4 top-16 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-[#20B2AA] to-[#48D1CC] p-4 text-white">
            <h3 className="font-bold text-lg">การแจ้งเตือน</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    notif.type === 'new' ? 'bg-blue-500' : 
                    notif.type === 'update' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* CSS Animation for fade-in effect */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
export default RoutePlanningSystem;
