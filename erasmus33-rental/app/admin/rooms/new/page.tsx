"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardFooter } from "@heroui/card";
import { TrashIcon } from "@heroicons/react/24/solid";

import { Room } from "@/interfaces/room";
import { supabase } from "@/lib/supabase";
import ImageCropper from "@/components/image-cropper";
import { Avatar, Checkbox, Select, SelectItem, Textarea } from "@heroui/react";
import { User } from "@/interfaces/user";
import { House } from "@/interfaces/house";
import { UUID } from "crypto";

interface RoomImage {
  file: File;
  url: string;
}

const roomTypes = [
  { key: "Single", value: 1 },
  { key: "Double", value: 2 },
  { key: "Triple", value: 3 },
  { key: "Quad", value: 4 },
];

export default function AdminRoomCreatePage() {
  const router = useRouter();

  // State for room details
  const [room, setRoom] = useState<Room>({
    description: "",
    house: "" as UUID,
    price: 0,
    is_available: true,
    images: [],
    number: 0,
    beds: 0,
    renters: [],
  });

  // State for houses and users
  const [houses, setHouses] = useState<House[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const [newRoomImages, setNewRoomImages] = useState<RoomImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch houses from database
    const fetchHouses = async () => {
      const { data, error } = await supabase.from("houses").select("*");
      if (error) throw error;
      if (data) setHouses(data);
    };

    // Fetch users from database
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      if (data) setUsers(data);
    };

    fetchHouses();
    fetchUsers();
  }, []);

  // Update UI with new image
  const updateRoomImagesUI = (file: File) => {
    const newUrl = URL.createObjectURL(file);
    setNewRoomImages((prevImages) => [...prevImages, { file, url: newUrl }]);
  };

  // Remove image from UI
  const deleteRoomImageFromUI = (imageUrl: string) => {
    setNewRoomImages((prevImages) =>
      prevImages.filter((image) => image.url !== imageUrl),
    );
  };

  // Handle form submission
  const insertRoomData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomId = await createRoomInDatabase();

      if (roomId && newRoomImages.length > 0) {
        await uploadRoomImages(roomId);
      }

      router.push("/admin/rooms");
    } catch (error) {
      console.error("Error during room creation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create room in the database
  const createRoomInDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            description: room.description,
            house: room.house,
            price: room.price,
            is_available: room.is_available,
          },
        ])
        .select("id")
        .single();

      if (error) throw error;

      return data?.id || null;
    } catch (error) {
      console.error("Error creating room in database:", error);
      return null;
    }
  };

  // Upload images to storage and update database
  const uploadRoomImages = async (roomId: string) => {
    const uploadedImageUrls: string[] = [];

    try {
      await Promise.all(
        newRoomImages.map(async (image, index) => {
          const filePath = `${roomId}/${index}`; // Unique file path

          const { data: uplData, error: uplError } = await supabase.storage
            .from("room_images")
            .upload(filePath, image.file);

          if (uplError || !uplData) throw uplError;

          const { data: urlData } = supabase.storage
            .from("room_images")
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            uploadedImageUrls.push(urlData.publicUrl);
          }
        }),
      );

      if (uploadedImageUrls.length > 0) {
        const updatedImages = [...room.images, ...uploadedImageUrls]; // Merge images
        const { error } = await supabase
          .from("rooms")
          .update({ images: updatedImages })
          .eq("id", roomId);

        if (error) throw error;

        setRoom((prevRoom) => ({ ...prevRoom, images: updatedImages })); // Update state
      }
    } catch (error) {
      console.error("Error uploading room images:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Registering a new room</h1>
        <Button variant="bordered" onPress={() => router.push("/admin/rooms")}>
          Back to Rooms
        </Button>
      </div>

      <Card className="p-4">
        <form className="space-y-4" onSubmit={insertRoomData}>
          {/* Room Details Section */}
          <p>Room Details</p>
          <div className="grid grid-cols-6 gap-4">
            <Select label="House" disabled={houses === null}>
              {houses &&
                Object.values(houses).map((house) => (
                  <SelectItem
                    key={house.id}
                    textValue={`House ${house.number}`}
                    onPress={() => {
                      if (house.id) {
                        setRoom({ ...room, house: house.id });
                      }
                    }}
                  >
                    {house.number}
                  </SelectItem>
                ))}
            </Select>
            <Input
              required
              label="Room Number"
              type="number"
              value={room.number.toString()}
              onChange={(e) =>
                setRoom({ ...room, number: parseInt(e.target.value, 10) })
              }
            />
            <Select
              label="Room Type"
              disabled={roomTypes === null}
              className="mb-6"
            >
              {roomTypes &&
                roomTypes.map((type) => (
                  <SelectItem
                    key={type.key}
                    textValue={`${type.key}`}
                    onPress={() => setRoom({ ...room, beds: type.value })}
                  >
                    {type.key}
                  </SelectItem>
                ))}
            </Select>
            <Input
              required
              label="Price"
              type="number"
              value={room.price.toString()}
              onChange={(e) =>
                setRoom({ ...room, price: parseFloat(e.target.value) })
              }
            />
            <Select
              className="col-span-2"
              label="Renter"
              disabled={users === null}
            >
              {users &&
                users.map((user) => (
                  <SelectItem
                    key={user.id}
                    textValue={`${user.first_name} ${user.last_name}`}
                    className="flex items-center"
                    onPress={() =>
                      user.id &&
                      setRoom({ ...room, renters: [...room.renters, user.id] })
                    }
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                      {user.first_name + " " + user.last_name}
                    </div>
                  </SelectItem>
                ))}
            </Select>
          </div>
          <div className="gap-4">
            <Input
              label="Description"
              size="lg"
              type="text"
              value={room.description}
              onChange={(e) =>
                setRoom({ ...room, description: e.target.value })
              }
            />
          </div>

          {/* Image Upload Section */}
          <div className="flex items-center gap-4">
            <ImageCropper
              aspectRatio="16/9"
              isCircular={false}
              callback={(file) => {
                updateRoomImagesUI(file);
              }}
            />
            <p>
              {room.images.length === 0
                ? "Upload an image to the room"
                : "Add new image"}
            </p>
          </div>
          <div>
            {newRoomImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {newRoomImages.map((image, index) => (
                  <Card key={index} className="cursor-pointer">
                    <img
                      alt={`Room Image ${index}`}
                      className="w-full h-48 object-cover rounded"
                      src={image.url}
                      width={320} // Add width
                      height={180} // Add height
                    />
                    <CardFooter className="flex justify-end">
                      <Button
                        className="h-10"
                        color="danger"
                        variant="solid"
                        onPress={() => deleteRoomImageFromUI(image.url)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex justify-between">
            <Button color="primary" type="submit" variant="solid">
              Confirm Creation
            </Button>
            <Checkbox
              className="mb-2"
              size="lg"
              checked={room.is_available}
              onChange={(e) =>
                setRoom({ ...room, is_available: e.target.checked })
              }
              defaultSelected
            >
              {room.is_available ? "Available" : "Not Available"}
            </Checkbox>
          </div>
        </form>
      </Card>
    </div>
  );
}
