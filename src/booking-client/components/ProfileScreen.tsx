import React, { useState, useEffect } from 'react';
import { StaffMember, Role } from '../types';
import { api } from '../services/api';

interface ProfileScreenProps {
    currentUser: StaffMember | null;
    onUpdateUser: (updatedUser: StaffMember) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onUpdateUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-500">Please log in to view your profile.</p>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            const updatedUser = await api.updateStaffMember({
                ...currentUser,
                name,
                email,
            });
            onUpdateUser(updatedUser);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case Role.Admin: return 'bg-purple-100 text-purple-800';
            case Role.Manager: return 'bg-blue-100 text-blue-800';
            case Role.Owner: return 'bg-amber-100 text-amber-800';
            default: return 'bg-slate-100 text-slate-800'; // Employee
        }
    };

    const getRoleName = (role: Role) => {
        return Role[role];
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0 bg-indigo-600 md:w-48 flex flex-col items-center justify-center p-8">
                        <div className="h-24 w-24 rounded-full bg-indigo-400 flex items-center justify-center text-white text-3xl font-bold mb-4 border-4 border-white">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(currentUser.role)} bg-opacity-90`}>
                            {getRoleName(currentUser.role)}
                        </div>
                    </div>
                    <div className="p-8 w-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">My Profile</h2>
                                <p className="text-sm text-slate-500">Manage your account details</p>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 border-b border-slate-100 pb-2">{currentUser.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 border-b border-slate-100 pb-2">{currentUser.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Account Status</label>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${currentUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-slate-900">{currentUser.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setName(currentUser.name);
                                            setEmail(currentUser.email);
                                            setError(null);
                                        }}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
