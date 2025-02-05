// 'use client';

// import { cn } from '@/lib/utils';
// import {
//   setCalculatedZIndex,
//   setClassNameAndIsDisabled,
//   setMenuPortalTarget,
// } from '@/utility/selectHelpers';
// import { zodResolver } from '@hookform/resolvers/zod';
// import 'flowbite';
// import { initFlowbite } from 'flowbite';
// import { SquarePen, X } from 'lucide-react';
// import React, { useEffect, useRef, useState } from 'react';
// import { Controller, useForm } from 'react-hook-form';
// import Select from 'react-select';
// import { currencyOptions } from '../create-client/components/Form';
// import { ClientDataType, validationSchema } from '../schema';

// const baseZIndex = 50; // 52

// interface PropsType {
//   loading: boolean;
//   clientData: ClientDataType;
//   marketerNames: string[];
//   submitHandler: (editedClientData: ClientDataType) => Promise<void>;
// }

// const EditButton: React.FC<PropsType> = props => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const popupRef = useRef<HTMLElement>(null);
//   const formRef = useRef<HTMLFormElement>(null);

//   const marketerOptions = (props.marketerNames || []).map(name => ({
//     label: name,
//     value: name,
//   }));

//   const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (
//       popupRef.current &&
//       !popupRef.current.contains(e.target as Node) &&
//       !popupRef.current.querySelector('input:focus, textarea:focus') &&
//       !popupRef.current.querySelector('button:focus')
//     ) {
//       setIsOpen(false);
//     }
//   };

//   const {
//     watch,
//     register,
//     handleSubmit,
//     control,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<ClientDataType>({
//     resolver: zodResolver(validationSchema),
//     defaultValues: {
//       ...props.clientData,
//     },
//   });

//   useEffect(() => {
//     initFlowbite();
//   }, []);

//   const onSubmit = async (data: ClientDataType) => {
//     await props.submitHandler(data);
//   };

//   useEffect(() => {
//     if (isOpen) {
//       reset(props.clientData);
//     }
//     console.log(props.clientData);
//   }, [isOpen]);

//   return (
//     <>
//       <button
//         onClick={() => {
//           setIsOpen(true);
//         }}
//         className="rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
//       >
//         <SquarePen size={18} />
//       </button>

//       <section
//         onClick={handleClickOutside}
//         className={`fixed z-${baseZIndex} inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
//       >
//         <article
//           ref={popupRef}
//           onClick={e => e.stopPropagation()}
//           className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-sm shadow relative md:w-[60vw] lg:w-[40vw]  text-wrap`}
//         >
//           <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
//             <h3 className="text-gray-900 text-base lg:text-lg font-semibold uppercase">
//               Edit Client
//             </h3>
//             <button
//               onClick={() => setIsOpen(false)}
//               type="button"
//               className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
//             >
//               <X size={18} />
//             </button>
//           </header>

//           <form
//             ref={formRef}
//             className="overflow-x-hidden overflow-y-scroll max-h-[70vh] p-4 text-start"
//             onSubmit={handleSubmit(onSubmit)}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Client Code*</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.client_code && errors.client_code.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('client_code')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Client Name*</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.client_name && errors.client_name.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('client_name')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Marketer Name*</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.marketer && errors.marketer?.message}
//                   </span>
//                 </label>

//                 <Controller
//                   name="marketer"
//                   control={control}
//                   render={({ field }) => (
//                     <Select
//                       {...setClassNameAndIsDisabled(isOpen)}
//                       options={marketerOptions}
//                       closeMenuOnSelect={true}
//                       placeholder="Select marketer"
//                       classNamePrefix="react-select"
//                       menuPortalTarget={setMenuPortalTarget}
//                       menuPlacement="auto"
//                       menuPosition="fixed" // Prevent clipping by parent containers
//                       styles={setCalculatedZIndex(baseZIndex)}
//                       value={
//                         marketerOptions.find(
//                           option => option.value === field.value,
//                         ) || null
//                       }
//                       onChange={option =>
//                         field.onChange(option ? option.value : '')
//                       }
//                     />
//                   )}
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Category</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.category && errors.category.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('category')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Contact Person</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.contact_person && errors.contact_person.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('contact_person')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Designation</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.designation && errors.designation.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('designation')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Contact Number</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.contact_number && errors.contact_number.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('contact_number')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Email</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.email && errors.email.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('email')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Address</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.address && errors.address.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('address')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Country</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.country && errors.country.message}
//                   </span>
//                 </label>
//                 <input
//                   {...register('country')}
//                   className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                   type="text"
//                 />
//               </div>
//               <div>
//                 <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                   <span className="uppercase">Currency</span>
//                   <span className="text-red-700 text-wrap block text-xs">
//                     {errors.currency && errors.currency?.message}
//                   </span>
//                 </label>

//                 <Controller
//                   name="currency"
//                   control={control}
//                   render={({ field }) => (
//                     <Select
//                       {...setClassNameAndIsDisabled(isOpen)}
//                       options={currencyOptions}
//                       closeMenuOnSelect={true}
//                       placeholder="Select currency"
//                       classNamePrefix="react-select"
//                       menuPortalTarget={setMenuPortalTarget}
//                       menuPlacement="auto"
//                       menuPosition="fixed"
//                       styles={setCalculatedZIndex(baseZIndex)}
//                       value={
//                         currencyOptions.find(
//                           option => option.value === field.value,
//                         ) || null
//                       }
//                       onChange={option =>
//                         field.onChange(option ? option.value : '')
//                       }
//                     />
//                   )}
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
//                 <span className="uppercase">Prices</span>
//                 <span className="text-red-700 text-wrap block text-xs">
//                   {errors.prices && errors.prices?.message}
//                 </span>
//               </label>
//               <textarea
//                 {...register('prices')}
//                 rows={5}
//                 className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//                 placeholder="List cost of services pitched to client"
//               />
//             </div>
//           </form>

//           <footer
//             className={cn(
//               'flex items-center px-4 py-2 border-t justify-between gap-6 border-gray-200 rounded-b',
//               !watch('updated_by') && 'justify-end',
//             )}
//           >
//             {watch('updated_by') && (
//               <div className="flex justify-start items-center me-auto text-gray-400">
//                 <span className="me-1">Last updated by </span>

//                 <span className="font-semibold">{watch('updated_by')}</span>
//               </div>
//             )}
//             <div className="space-x-2 justify-end">
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="rounded-md bg-gray-600 text-white hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
//                 type="button"
//                 disabled={props.loading}
//               >
//                 Close
//               </button>
//               <button
//                 disabled={props.loading}
//                 onClick={() => {
//                   formRef.current?.requestSubmit();
//                 }}
//                 className="rounded-md bg-blue-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
//                 type="button"
//               >
//                 {props.loading ? 'Submitting...' : 'Submit'}
//               </button>
//             </div>
//           </footer>
//         </article>
//       </section>
//     </>
//   );
// };

// export default EditButton;
