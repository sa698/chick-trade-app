// "use client";

// import React, {
//   ElementRef,
//   useRef,
//   useState,
// } from "react";
// import { useEventListener, useOnClickOutside } from "usehooks-ts";
// import { ListWrapper } from "./list-wrapper";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";

// import { Input } from "@/components/ui/input";
// import { z } from "zod";
// import { List } from "@prisma/client";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "sonner";

// // Zod schema
// const formSchema = z.object({
//   title: z.string().nonempty("Title is required"),
//   orderNo: z.string().optional(),
//   orderId: z.string(),
//   userId: z.string().optional(),
//   orgId: z.string().optional(),
// });
// type ListFormValues = z.infer<typeof formSchema>;

// interface ListFormProps {
//   initialData?: List | null;
// }

// export const ListForm: React.FC<ListFormProps> = ({ initialData }) => {
//   const params = useParams();
//   const router = useRouter();

//   // Correctly typed formRef for <form> element
//   const formRef = useRef<HTMLFormElement>(null);
//   const inputRef = useRef<ElementRef<"input">>(null);

//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [orderType, setOrderType] = useState("sales");

//   const enableEditing = () => {
//     setIsEditing(true);
//     setTimeout(() => {
//       inputRef.current?.focus();
//     });
//   };

//   const disableEditing = () => {
//     setIsEditing(false);
//   };

//   const onKeyDown = (e: globalThis.KeyboardEvent) => {
//     if (e.key === "Escape") {
//       disableEditing();
//     }
//   };
//   useEventListener("keydown", onKeyDown);

//   // Cast formRef to RefObject<HTMLElement> for useOnClickOutside
//   useOnClickOutside(formRef as React.RefObject<HTMLElement>, disableEditing);

//   const form = useForm<ListFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: initialData
//       ? {
//           title: initialData.title,
//           orderNo: initialData.orderNo?.toString() || "",
//           orderId: initialData.orderId || "",
//           userId: initialData.userId || "",
//           orgId: initialData.orgId || "",
//         }
//       : {
//           title: "",
//           orderId: params?.orderId?.toString() ?? "",
//         },
//   });

//   const onSubmit = async (data: ListFormValues) => {
//     try {
//       setLoading(true);
//       await axios.post(`/api/${params.organizationId}/list`, {
//         ...data,
//         type: orderType, // Optional: Send selected type
//       });
//       disableEditing();
//       router.refresh();
//       toast.success("Order added successfully.");
//       form.reset();
//     } catch (error: any) {
//       toast.error("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isEditing) {
//     return (
//       <ListWrapper>
//         <Form {...form}>
//           <form
//             ref={formRef}
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="w-full p-3 rounded-md  space-y-4 shadow-md"
//           >
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl ref={inputRef}>
//                     <Input {...field} placeholder="Order title" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="orderId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input type="hidden" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <div className="flex items-center gap-x-1">
//               <Button disabled={loading} type="submit">
//                 Add List
//               </Button>
//               <Button
//                 disabled={loading}
//                 onClick={disableEditing}
//                 size="sm"
//                 variant="ghost"
//               >
//                 <X className="w-5 h-5" />
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </ListWrapper>
//     );
//   }

//   return null
  
//   // (
//   //   <ListWrapper>
//   //     <Button variant="outline" className="w-full" onClick={enableEditing}>
//   //       Add Order: {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
//   //     </Button>
//   //   </ListWrapper>
//   // );
// };
