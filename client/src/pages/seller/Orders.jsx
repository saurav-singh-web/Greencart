import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Package, Clock, Truck, CheckCircle2, ChevronRight, Phone, MapPin } from 'lucide-react'

const initialColumns = {
    'Order Placed': { id: 'Order Placed', title: 'Pending', icon: Clock, color: 'amber' },
    'Processing': { id: 'Processing', title: 'Processing', icon: Package, color: 'blue' },
    'Shipped': { id: 'Shipped', title: 'Shipped', icon: Truck, color: 'indigo' },
    'Delivered': { id: 'Delivered', title: 'Delivered', icon: CheckCircle2, color: 'emerald' },
}

const Orders = () => {
    const { currency, axios } = useAppcontext()
    const [orders, setOrders] = useState([])
    const [columns, setColumns] = useState(initialColumns)

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller')
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, status: newStatus })
            if (data.success) {
                toast.success(`Order moved to ${newStatus}`)
            } else {
                toast.error(data.message)
                fetchOrders() // Revert UI
            }
        } catch (error) {
            toast.error(error.message)
            fetchOrders() // Revert UI
        }
    }

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result

        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        const orderId = draggableId
        const newStatus = destination.droppableId
        const oldStatus = source.droppableId

        // Enforce forward-only state transitions
        const STATUS_ORDER = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
        const sourceIndex = STATUS_ORDER.indexOf(oldStatus);
        const destIndex = STATUS_ORDER.indexOf(newStatus);

        if (destIndex < sourceIndex) {
            toast.error("Orders cannot be moved backwards in the fulfillment process.");
            return;
        }

        // Optimistically update UI
        const updatedOrders = orders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
        )
        setOrders(updatedOrders)

        // API Call
        if (oldStatus !== newStatus) {
            updateOrderStatus(orderId, newStatus)
        }
    }

    const getColumnOrders = (columnId) => {
        return orders.filter(order => order.status === columnId || (columnId === 'Order Placed' && !order.status))
    }

    return (
        <div className="flex flex-col gap-8 pb-12 h-[calc(100vh-8rem)]">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Order Fulfillment</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Drag and drop orders to update their status.</p>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
                    {Object.values(columns).map(column => {
                        const columnOrders = getColumnOrders(column.id)
                        const Icon = column.icon

                        return (
                            <div key={column.id} className="flex flex-col min-w-[320px] max-w-[320px] bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl p-4 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-5 h-5 text-${column.color}-500`} />
                                        <h3 className="font-extrabold text-slate-700 dark:text-slate-200">{column.title}</h3>
                                    </div>
                                    <span className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                        {columnOrders.length}
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto space-y-4 custom-scrollbar ${snapshot.isDraggingOver ? `bg-${column.color}-50/50 dark:bg-${column.color}-900/10 rounded-2xl` : ''}`}
                                        >
                                            {columnOrders.map((order, index) => (
                                                <Draggable key={order._id} draggableId={order._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm ${snapshot.isDragging ? 'shadow-xl ring-2 ring-emerald-500 scale-105' : 'hover:border-emerald-500/50'} transition-all`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                                                <div>
                                                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">#{order._id.slice(-6)}</p>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                                                                        {order.address?.firstName} {order.address?.lastName}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold text-emerald-500">{currency}{order.amount}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="space-y-2 mb-3">
                                                                {order.items.slice(0, 2).map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{item.product?.name}</span>
                                                                        <span className="font-bold text-slate-500">x{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                                {order.items.length > 2 && (
                                                                    <p className="text-xs text-slate-400 italic">+{order.items.length - 2} more items</p>
                                                                )}
                                                            </div>

                                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                                <div className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md ${order.isPaid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                                    {order.isPaid ? 'PAID' : 'COD'}
                                                                </div>
                                                                <button className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>
            </DragDropContext>
        </div>
    )
}

export default Orders