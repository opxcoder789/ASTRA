import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, Check, Plus, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface UserAddress {
  id?: number;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [newAddress, setNewAddress] = useState<UserAddress>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchUserProfile();
    fetchUserAddresses();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          phone: ''
        };
        setProfile(newProfile);
        await createUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching addresses:', error);
      } else {
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const createUserProfile = async (profileData: UserProfile) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        alert('Error saving profile: ' + error.message);
      } else {
        alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    if (!user) return;

    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      alert('Please fill in all required address fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert({
          ...newAddress,
          user_id: user.id
        });

      if (error) {
        alert('Error saving address: ' + error.message);
      } else {
        alert('Address saved successfully!');
        setNewAddress({
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'India',
          is_default: false
        });
        fetchUserAddresses();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address');
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        alert('Error deleting address: ' + error.message);
      } else {
        fetchUserAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Error deleting address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader color="#ffffff" size="65px" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User size={32} />
          My Profile
        </h1>

        {/* Profile Information */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
            <User size={120} />
          </div>

          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <User size={20} className="text-blue-400" />
            Personal Information
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xl">
            Update your basic contact details. This information helps us personalize your experience and reach out to you if needed.
          </p>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                placeholder="Ex: Prakhar"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                placeholder="Ex: Vardhan"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-4 bg-neutral-900 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed italic"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] bg-neutral-800 px-2 py-1 rounded-md text-gray-400 border border-white/5 uppercase">Fixed</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 ml-1">Your primary identity. Can't be changed for security.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                placeholder="+91 00000 00000"
              />
              <p className="text-[10px] text-gray-500 ml-1">Important for delivery updates and tracking.</p>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-10 w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Update Records'}
          </button>
        </div>

        {/* Addresses */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <MapPin size={20} className="text-emerald-400" />
            Where should we ship?
          </h2>
          <p className="text-gray-400 text-sm mb-10 max-w-xl">
            Register your delivery locations. You can add multiple addresses and set one as your primary default.
          </p>

          {/* Existing Addresses */}
          {addresses.length > 0 && (
            <div className="mb-12">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Saved Locations</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all group/addr">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">{address.address_line1}</p>
                        {address.address_line2 && <p className="text-gray-400 text-sm mb-1">{address.address_line2}</p>}
                        <p className="text-gray-500 text-xs">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">{address.country}</p>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full mt-4 border border-emerald-500/20 font-bold uppercase tracking-wider">
                            <Check size={10} className="stroke-[3]" /> Default Address
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAddress(address.id!)}
                        className="p-2 opacity-0 group-hover/addr:opacity-100 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Remove Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Address */}
          <div className="bg-white/5 p-8 rounded-3xl border border-dashed border-white/20">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <Plus size={20} className="bg-emerald-500 text-black rounded-full p-0.5" />
              Register New Address
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Full Street Address *</label>
                <input
                  type="text"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Street name, building num, floor, etc."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Apartment / Unit (Optional)</label>
                <input
                  type="text"
                  value={newAddress.address_line2}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Suite, apartment, or flat number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">City *</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">State / Region *</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="State name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Postal / ZIP Code *</label>
                <input
                  type="text"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Pincode/Zipcode"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Country</label>
                <select
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full px-4 py-4 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-[58px]"
                >
                  <option value="India">🇮🇳 India</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-2">
                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer hover:text-white select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 bg-white/5 border-white/10 rounded focus:ring-emerald-500/50"
                  />
                  <span>Mark as my primary delivery address</span>
                </label>
              </div>
            </div>

            <button
              onClick={saveAddress}
              disabled={saving}
              className="mt-10 bg-emerald-500 text-black px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-3 shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Confirm Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}