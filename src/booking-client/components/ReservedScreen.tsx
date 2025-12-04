import React, { useState, useEffect } from 'react';
import { Location, Desk, StaffMember } from '../types';
import { api } from '../services/api';

interface ReservedScreenProps {
    onRefresh: () => void;
}

const ReservedScreen: React.FC<ReservedScreenProps> = ({ onRefresh }) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [desks, setDesks] = useState<Desk[]>([]);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [locs, dks, staff] = await Promise.all([
                api.fetchLocations(),
                api.fetchDesks(),
                api.fetchStaffMembers()
            ]);
            setLocations(locs);
            setDesks(dks);
            setStaffMembers(staff);
            if (locs.length > 0 && !selectedLocationId) {
                setSelectedLocationId(locs[0].id);
            }
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDesks = desks.filter(d => d.locationId === selectedLocationId);

    const handleOpenModal = (desk: Desk) => {
        setSelectedDesk(desk);
        setSelectedStaffId(desk.reservedForStaffMemberId || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDesk(null);
        setSelectedStaffId('');
    };

    const handleSaveReservation = async () => {
        if (!selectedDesk) return;

        try {
            setIsLoading(true);
            const updatedDesk = {
                ...selectedDesk,
                reservedForStaffMemberId: selectedStaffId || undefined, // undefined to remove reservation
                isReserved: !!selectedStaffId
            };

            await api.updateDesk(updatedDesk);

            // Update local state
            setDesks(prev => prev.map(d => d.id === updatedDesk.id ? updatedDesk : d));

            handleCloseModal();
            onRefresh(); // Notify parent if needed, though we updated local state
        } catch (err) {
            setError('Failed to update reservation');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStaffName = (id?: string) => {
        if (!id) return 'Unassigned';
        const staff = staffMembers.find(s => s.id === id);
        return staff ? staff.name : 'Unknown Staff';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Reserved Desks Management</h2>
                <div className="w-64">
                    <select
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-sm font-bold">Dismiss</button>
                </div>
            )}

            {isLoading && !desks.length ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">Loading...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDesks.map(desk => (
                        <div
                            key={desk.id}
                            className={`p-4 rounded-lg border-2 transition-all ${desk.isReserved
                                    ? 'border-indigo-200 bg-indigo-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-800">{desk.label}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{desk.type}</p>
                                </div>
                                {desk.isReserved && (
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                                        Reserved
                                    </span>
                                )}
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-slate-600 mb-1">Assigned to:</p>
                                <p className={`font-medium ${desk.isReserved ? 'text-indigo-900' : 'text-slate-400 italic'}`}>
                                    {desk.isReserved ? getStaffName(desk.reservedForStaffMemberId) : 'No one'}
                                </p>
                            </div>

                            <button
                                onClick={() => handleOpenModal(desk)}
                                className={`mt-4 w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${desk.isReserved
                                        ? 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                                        : 'bg-slate-800 text-white hover:bg-slate-700'
                                    }`}
                            >
                                {desk.isReserved ? 'Edit Reservation' : 'Reserve Desk'}
                            </button>
                        </div>
                    ))}

                    {filteredDesks.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">No desks found for this location.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit/Add Reservation Modal */}
            {isModalOpen && selectedDesk && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            {selectedDesk.isReserved ? 'Edit Reservation' : 'Reserve Desk'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Set reservation for <span className="font-semibold">{selectedDesk.label}</span>.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Assign to Staff Member
                            </label>
                            <select
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- No Reservation (Free) --</option>
                                {staffMembers.filter(s => s.isActive).map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name} ({staff.email})
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-slate-500">
                                Selecting "No Reservation" will free up this desk for daily bookings.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveReservation}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservedScreen;
