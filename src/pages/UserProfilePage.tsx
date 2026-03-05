import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

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
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
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
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User size={20} />
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Addresses */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin size={20} />
            Shipping Addresses
          </h2>

          {/* Existing Addresses */}
          {addresses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Saved Addresses</h3>
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{address.address_line1}</p>
                        {address.address_line2 && <p className="text-gray-400">{address.address_line2}</p>}
                        <p className="text-gray-400">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-gray-400">{address.country}</p>
                        {address.is_default && (
                          <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mt-2">
                            Default
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAddress(address.id!)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Address */}
          <div>
            <h3 className="text-lg font-medium mb-4">Add New Address</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={newAddress.address_line2}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code *</label>
                <input
                  type="text"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Postal Code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                <select
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/50"
                  />
                  Set as default address
                </label>
              </div>
            </div>

            <button
              onClick={saveAddress}
              disabled={saving}
              className="mt-6 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}