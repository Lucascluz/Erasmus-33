'use client';

import {
	Navbar as HeroUINavbar,
	NavbarContent,
	NavbarBrand,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
} from '@heroui/navbar';
import { Link } from '@heroui/link';
import { link as linkStyles } from '@heroui/theme';
import NextLink from 'next/link';
import clsx from 'clsx';
import { Avatar } from '@heroui/avatar';
import { siteConfig } from '@/config/site';
import { ThemeSwitch } from '@/components/theme-switch';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase'; // Ensure you have this file
import { Button } from '@heroui/button';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user || null);
			if (session?.user) {
				const { data, error } = await supabase
					.from('users')
					.select('role')
					.eq('id', session.user.id)
					.single();
				if (!error && data) {
					setRole(data.role);
				}
			} else supabase.auth.signOut();
		};

		fetchUser();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user || null);
				if (session?.user) {
					supabase
						.from('users')
						.select('role')
						.eq('id', session.user.id)
						.single()
						.then(({ data, error }) => {
							if (!error && data) {
								setRole(data.role);
							}
						});
				}
				router.refresh();
			}
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [router]);

	return (
		<HeroUINavbar
			maxWidth='xl'
			position='sticky'
			isMenuOpen={isMenuOpen}
			isBordered>
			<NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
					className='lg:hidden'
					onClick={() => setIsMenuOpen(!isMenuOpen)}
				/>
				<NavbarBrand
					as='li'
					className='gap-3 max-w-fit'
					onClick={() => setIsMenuOpen(false)}>
					<NextLink className='flex justify-start items-center gap-4' href='/'>
						<Avatar
							className='w-12 h-12 text-large'
							src='https://gkpotoixqcjijozesfee.supabase.co/storage/v1/object/public/assets//271729632_265800025651586_8565946951297877827_n.jpg'
						/>
						<p className='font-bold text-inherit text-xl'>Erasmus 33</p>
					</NextLink>
				</NavbarBrand>
				<ul className='hidden lg:flex gap-4 justify-start ml-2'>
					{user
						? (role === 'admin' ? siteConfig.navAdminItems : siteConfig.navItems).map(
								(item) => (
									<NavbarItem key={item.href}>
										<NextLink
											className={clsx(
												linkStyles({ color: 'foreground' }),
												'data-[active=true]:text-primary data-[active=true]:font-medium'
											)}
											color='foreground'
											href={item.href}>
											{item.label}
										</NextLink>
									</NavbarItem>
								)
							)
						: siteConfig.navItems.map((item) => (
								<NavbarItem key={item.href}>
									<NextLink
										className={clsx(
											linkStyles({ color: 'foreground' }),
											'data-[active=true]:text-primary data-[active=true]:font-medium'
										)}
										color='foreground'
										href={item.href}>
										{item.label}
									</NextLink>
								</NavbarItem>
							))}
				</ul>
			</NavbarContent>

			<NavbarContent
				className='hidden sm:flex basis-1/5 sm:basis-full'
				justify='end'>
				<NavbarItem className='hidden sm:flex gap-2'>
					<Link isExternal aria-label='WhatsApp' href={siteConfig.links.whatsapp}>
						<Icon
							icon='mdi:whatsapp'
							width={32}
							height={32}
							className='text-green-500'
						/>
					</Link>
				</NavbarItem>
				<NavbarItem className='hidden sm:flex gap-2'>
					<ThemeSwitch />
				</NavbarItem>
				{/* Profile/Auth Button */}
				<NavbarItem>
					<Button
						as={NextLink}
						href={
							user ? (role === 'admin' ? 'admin/profile' : '/profile') : '/auth/login/'
						}
						color='primary'
						variant='solid'>
						{user ? 'Profile' : 'Login'}
					</Button>
				</NavbarItem>
			</NavbarContent>
			<NavbarMenu>
				{user
					? (role === 'admin' ? siteConfig.navAdminItems : siteConfig.navItems).map(
							(item) => (
								<NavbarMenuItem key={item.href}>
									<NextLink
										className={clsx(
											linkStyles({ color: 'foreground' }),
											'data-[active=true]:text-primary data-[active=true]:font-medium'
										)}
										color='foreground'
										href={item.href}>
										<p
											onClick={() => {
												setIsMenuOpen(false);
											}}>
											{item.label}
										</p>
									</NextLink>
								</NavbarMenuItem>
							)
						)
					: siteConfig.navItems.map((item) => (
							<NavbarMenuItem key={item.href}>
								<NextLink
									className={clsx(
										linkStyles({ color: 'foreground' }),
										'data-[active=true]:text-primary data-[active=true]:font-medium'
									)}
									color='foreground'
									href={item.href}>
									{item.label}
								</NextLink>
							</NavbarMenuItem>
						))}
			</NavbarMenu>
		</HeroUINavbar>
	);
};
