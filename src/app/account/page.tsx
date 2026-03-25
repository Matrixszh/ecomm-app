'use client';

import { useAuthStore } from '@/store/authStore';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import type { CloudinaryImage } from '@/types';

export default function AccountProfile() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { mongoUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<CloudinaryImage[]>(
    mongoUser?.avatar ? [{ url: mongoUser.avatar, publicId: 'avatar' }] : []
  );

  return (
    <div className="bg-[#ffffff] border border-[#d0c5af] p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xs tracking-[0.24em] uppercase text-[#1c1c18]">Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs tracking-[0.24em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-32 h-32 relative bg-[#f6f3ed] overflow-hidden border border-[#d0c5af] mb-4 flex items-center justify-center">
            {avatar.length > 0 ? (
              hasCloudinary ? (
                <CldImage src={avatar[0].url} alt="Avatar" fill className="object-cover" sizes="128px" />
              ) : (
                <Image src={avatar[0].url} alt="Avatar" fill className="object-cover" sizes="128px" />
              )
            ) : (
              <User className="w-12 h-12 text-[#7f7663]" />
            )}
          </div>
          {isEditing && (
            <div className="w-full max-w-[150px]">
              <ImageUploader 
                images={avatar} 
                onChange={setAvatar} 
                maxImages={1} 
                folder="avatars" 
              />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue={mongoUser?.name} 
              disabled={!isEditing}
              className={`w-full bg-transparent border-b py-3 px-1 text-sm focus:outline-none focus:border-[#d4af37] ${isEditing ? 'border-[#d0c5af]' : 'border-transparent px-0'}`}
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Email</label>
            <input 
              type="email" 
              defaultValue={mongoUser?.email} 
              disabled
              className="w-full bg-transparent border-b border-transparent py-3 px-0 text-sm text-[#7f7663] cursor-not-allowed"
            />
            <p className="text-xs text-[#7f7663] mt-2">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Phone</label>
            <input 
              type="tel" 
              placeholder="+91 " 
              disabled={!isEditing}
              className={`w-full bg-transparent border-b py-3 px-1 text-sm focus:outline-none focus:border-[#d4af37] ${isEditing ? 'border-[#d0c5af]' : 'border-transparent px-0'}`}
            />
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-[#d4af37] text-[#1c1c18] px-8 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
