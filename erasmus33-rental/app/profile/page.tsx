'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@/interfaces/user';
export default function ProfilePage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchUser = async () => {
			const { data: session, error: sessionError } =
				await supabase.auth.getSession();
			if (sessionError || !session.session) {
				router.push('/sign-in');
				return;
			}
			const { data, error } = await supabase
				.from('users')
				.select('*')
				.eq('id', session.session.user.id)
				.single();
			if (error) {
				console.error('Error fetching user:', error);
			} else {
				setUser(data);
			}
			setLoading(false);
		};
		fetchUser();
	}, [router]);

	if (loading) return <div className='text-center p-4'>Loading...</div>;
	if (!user) return <div className='text-center p-4'>User not found.</div>;

	return (
		<div className='max-w-lg mx-auto p-6 shadow-md rounded-lg'>
			<h2 className='text-2xl font-bold mb-4'>{user.full_name}</h2>
			<p>
				<strong>Nationality:</strong> {user.nationality}
			</p>
			<p>
				<strong>Preferred Language:</strong> {user.preferred_language}
			</p>
			<p>
				<strong>Room:</strong> {user.room_number}
			</p>
			<p>
				<strong>House:</strong> {user.house_number}
			</p>
			<p>
				<strong>Arrival:</strong> {new Date(user.arrival_date).toLocaleDateString()}
			</p>
			<p>
				<strong>Departure Estimate:</strong>{' '}
				{new Date(user.departure_estimate).toLocaleDateString()}
			</p>
		</div>
	);
}
