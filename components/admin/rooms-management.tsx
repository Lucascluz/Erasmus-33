import React from 'react';
import {
	Card,
	CardHeader,
	CardBody,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Button,
} from '@heroui/react';
import { CheckIcon, EyeIcon, PencilIcon, Trash, XIcon } from 'lucide-react';
import { Room } from '@/interfaces/room';
import { redirect } from 'next/navigation';

export default function RoomsManagement({ rooms }: { rooms: Room[] }) {
	return (
		<Card className='w-full p-2'>
			<CardHeader className='flex justify-between'>
				<h3 className='text-lg font-semibold'>Rooms Management</h3>
				<Button
					color='primary'
					onPress={() => {
						redirect('/admin/rooms/new');
					}}>
					Add New Room
				</Button>
			</CardHeader>
			<CardBody>
				<Table aria-label='Rooms table'>
					<TableHeader>
						<TableColumn className='text-center'>HOUSE</TableColumn>
						<TableColumn className='text-center'>ROOM</TableColumn>
						<TableColumn className='text-center'>ROOM TYPE</TableColumn>
						<TableColumn className='text-center'>RENT</TableColumn>
						<TableColumn className='text-center'>RENTING</TableColumn>
						<TableColumn className='text-center'>ACTIONS</TableColumn>
					</TableHeader>
					<TableBody>
						{rooms.map((room) => (
							<TableRow key={room.id}>
								<TableCell className='text-center'>{room.house_number}</TableCell>
								<TableCell className='text-center'>{room.number}</TableCell>
								<TableCell className='text-center'>
									{room.type.charAt(0).toUpperCase() + room.type.slice(1)}
								</TableCell>
								<TableCell className='text-center'>{room.price}€</TableCell>
								<TableCell className='justify-center flex'>
									{!room.is_available ? (
										<CheckIcon className='text-success mx-auto' />
									) : (
										<XIcon className='text-danger mx-auto' />
									)}
								</TableCell>
								<TableCell className='text-center'>
									<div className='flex gap-4 justify-center'>
										<EyeIcon
											className='h-5 w-5 text-accent cursor-pointer'
											onClick={() => {
												redirect(`/protected/rooms/${room.id}`);
											}}
										/>
										<PencilIcon
											className='h-5 w-5 text-primary cursor-pointer'
											onClick={() => {
												redirect(`/admin/rooms/${room.id}/edit`);
											}}
										/>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardBody>
		</Card>
	);
}
