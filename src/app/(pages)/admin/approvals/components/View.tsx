'use client';

import { Change } from '@/lib/utils';
import { initFlowbite } from 'flowbite';
import {
  AlertCircle,
  Briefcase,
  Building2,
  ClipboardList,
  Eye,
  FileText,
  Minus,
  Plus,
  User,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { PopulatedApprovalType } from './Table';

// Helper function to get entity name from target model
function getEntityName(targetModel: string): string {
  switch (targetModel) {
    case 'User':
      return 'User';
    case 'Report':
      return 'Report';
    case 'Employee':
      return 'Employee';
    case 'Order':
      return 'Order';
    case 'Client':
      return 'Client';
    default:
      return 'Entity';
  }
}

// Helper function to get entity icon from target model
function getEntityIcon(targetModel: string) {
  switch (targetModel) {
    case 'User':
      return <User className="h-5 w-5" />;
    case 'Report':
      return <FileText className="h-5 w-5" />;
    case 'Employee':
      return <Briefcase className="h-5 w-5" />;
    case 'Order':
      return <ClipboardList className="h-5 w-5" />;
    case 'Client':
      return <Building2 className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

// Helper function to get action name from action type
function getActionName(action: string): string {
  switch (action) {
    case 'create':
      return 'Create';
    case 'update':
      return 'Update';
    case 'delete':
      return 'Delete';
    default:
      return 'Action';
  }
}

// Helper function to get action color from action type
function getActionColor(action: string): string {
  switch (action) {
    case 'create':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'delete':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'update':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return '';
  }
}

// Helper function to check if a value is an array
function isArray(value: any): boolean {
  return Array.isArray(value);
}

// Helper function to format field values for display
function formatValue(value: any): string | React.ReactNode {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  if (value === '') return '—';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Empty array';
    return value.join(', ');
  }
  return value;
}

// Helper function to render array values
function renderArrayValue(array: any[]): React.ReactNode {
  if (!array || array.length === 0)
    return <span className="text-gray-500 italic">Empty array</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {array.map((item, index) => (
        <span
          key={index}
          className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded-md text-xs"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// Helper function to render array changes
function renderArrayChanges(change: Change) {
  if (!('arrayChanges' in change)) return null;

  return (
    <div className="mt-4 space-y-2">
      {change.arrayChanges.added.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <Plus className="h-4 w-4" />
          <span>{change.arrayChanges.added.length} item(s) added</span>
        </div>
      )}
      {change.arrayChanges.removed.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <Minus className="h-4 w-4" />
          <span>{change.arrayChanges.removed.length} item(s) removed</span>
        </div>
      )}
    </div>
  );
}

interface ApprovalRequestViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvalData: PopulatedApprovalType;
  loading?: boolean;
}

export function ApprovalRequestViewModal({
  isOpen,
  onClose,
  approvalData,
  loading = false,
}: ApprovalRequestViewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine if this is a create, edit, or delete operation
  const isCreate = approvalData.action === 'create';
  const isUpdate = approvalData.action === 'update';
  const isDelete = approvalData.action === 'delete';

  // Get entity name and action for display
  const entityName = getEntityName(approvalData.target_model);
  const actionName = getActionName(approvalData.action);
  const actionColor = getActionColor(approvalData.action);
  const entityIcon = getEntityIcon(approvalData.target_model);

  useEffect(() => {
    initFlowbite();
  }, []);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      !modalRef.current.querySelector('input:focus, textarea:focus') &&
      !modalRef.current.querySelector('button:focus')
    ) {
      onClose();
    }
  };

  return (
    <section
      onClick={handleClickOutside}
      className={`fixed z-50 inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'}`}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-sm shadow relative md:w-[80vw] lg:w-[70vw] max-h-[90vh] transition-all duration-300`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${actionColor}`}
        >
          <div className="flex items-center gap-3">
            {entityIcon}
            <div>
              <h3 className="text-lg font-semibold">
                {actionName} {entityName} Request
              </h3>
              <p className="text-sm text-gray-600">
                Requested by{' '}
                <span className="font-medium">
                  {approvalData.req_by.real_name}
                </span>{' '}
                • {new Date(approvalData.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="space-y-6">
            {/* Request Details */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Request ID
                </h4>
                <p className="text-sm">{approvalData._id.toString()}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Entity ID
                </h4>
                <p className="text-sm">
                  {approvalData.object_id?.toString() || 'New Entity'}
                </p>
              </div>
              <div>
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Status
                </h4>
                <span
                  className={
                    approvalData.status === 'pending'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-md text-xs font-medium'
                      : approvalData.status === 'approved'
                        ? 'bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-md text-xs font-medium'
                        : 'bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-md text-xs font-medium'
                  }
                >
                  {approvalData.status.toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Request Type
                </h4>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${actionColor}`}
                >
                  {approvalData.target_model}{' '}
                  {approvalData.action.toUpperCase()}
                </span>
              </div>
            </div>

            <hr className="my-4" />

            {/* Update Request Content */}
            {isUpdate && approvalData.changes && (
              <div className="space-y-4">
                <h3 className="text-base font-medium">Changes Requested</h3>

                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 w-1/3">
                          Field
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/3">
                          Old Value
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/3">
                          New Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvalData.changes.map((change, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {change.field}
                              {isArray(change.oldValue) && (
                                <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-xs">
                                  Array
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isArray(change.oldValue) ? (
                              <div className="space-y-2">
                                {renderArrayValue(change.oldValue)}
                                {'arrayChanges' in change &&
                                  change.arrayChanges.removed.length > 0 && (
                                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                      <Minus className="h-3 w-3" />
                                      {change.arrayChanges.removed.length}{' '}
                                      item(s) removed
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block">
                                {formatValue(change.oldValue)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isArray(change.newValue) ? (
                              <div className="space-y-2">
                                {renderArrayValue(change.newValue)}
                                {'arrayChanges' in change &&
                                  change.arrayChanges.added.length > 0 && (
                                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                      <Plus className="h-3 w-3" />
                                      {change.arrayChanges.added.length} item(s)
                                      added
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                                {formatValue(change.newValue)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Create Request Content */}
            {isCreate && approvalData.new_data && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="text-base font-medium">
                    New {entityName} Details
                  </h3>
                </div>

                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 w-1/3">
                          Field
                        </th>
                        <th scope="col" className="px-6 py-3 w-2/3">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(approvalData.new_data).map(
                        ([field, value]) => (
                          <tr
                            key={field}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {field}
                            </td>
                            <td className="px-6 py-4">
                              {isArray(value) ? (
                                renderArrayValue(value as any[])
                              ) : (
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                                  {formatValue(value)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Delete Request Content */}
            {isDelete && approvalData.deleted_data && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-medium">
                    {entityName} to be Deleted
                  </h3>
                </div>

                <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">
                      This action will permanently delete the following data
                    </p>
                  </div>
                </div>

                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 w-1/3">
                          Field
                        </th>
                        <th scope="col" className="px-6 py-3 w-2/3">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(approvalData.deleted_data).map(
                        ([field, value]) => (
                          <tr
                            key={field}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {field}
                            </td>
                            <td className="px-6 py-4">
                              {isArray(value)
                                ? renderArrayValue(value as any[])
                                : formatValue(value)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-600 text-white hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
            type="button"
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ViewButton({
  loading,
  approvalData,
}: {
  loading: boolean;
  approvalData: PopulatedApprovalType;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-yellow-600 hover:opacity-90 hover:ring-2 hover:ring-yellow-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
      >
        <Eye size={18} />
      </button>

      <ApprovalRequestViewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        approvalData={approvalData}
        loading={loading}
      />
    </>
  );
}
