'use client';

import Badge from '@/components/Badge';
import { Change, cn } from '@/lib/utils';
import { formatDate, formatTime, formatTimestamp } from '@/utility/date';
import { initFlowbite } from 'flowbite';
import { AlertCircle, Eye, InfoIcon, Minus, Plus, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { PopulatedApprovalType } from './Table';

// Helper function to get entity name from target model
function getModelName(targetModel: string): string {
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

// Helper function to check if a value is an array
function isArray(value: any): boolean {
  return Array.isArray(value);
}

// Helper function to format field values for display
function formatValue(value: any): string | React.ReactNode {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  if (value === '') return '-';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.join(', ');
  }
  return value;
}

// Helper function to render array values
function renderArrayValue(array: any[]): React.ReactNode {
  if (!array || array.length === 0)
    return <span className="text-gray-500 italic">empty array</span>;

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

function sanitizeData(data: Record<string, any>): [string, any][] {
  const blacklist = ['createdAt', 'updatedAt', '__v', '_id'];
  return Object.entries(data).filter(([field]) => !blacklist.includes(field));
}

const baseZIndex = 50;

interface PropsType {
  loading: boolean;
  approvalData: PopulatedApprovalType;
  className?: string;
}

const ViewButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);
  const { approvalData } = props;

  // Determine if this is a create, edit, or delete operation
  const isCreate = approvalData.action === 'create';
  const isUpdate = approvalData.action === 'update';
  const isDelete = approvalData.action === 'delete';

  // Get entity name and action for display
  const modelName = getModelName(approvalData.target_model);
  const actionName = getActionName(approvalData.action);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target as Node) &&
      !popupRef.current.querySelector('input:focus, textarea:focus')
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={cn(
          `rounded-md bg-yellow-600 hover:opacity-90 hover:ring-2 hover:ring-yellow-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center`,
          props.className,
        )}
      >
        <Eye size={18} />
      </button>

      <section
        onClick={handleClickOutside}
        className={`fixed z-${baseZIndex} inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-lg lg:w-[35vw] md:w-[70vw] sm:w-[80vw] shadow relative`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-base flex-col text-left flex lg:text-lg font-semibold">
              <p className="font-semibold uppercase">
                {modelName} {actionName} Request
              </p>
              <p className="text-xs text-gray-400">
                Requested by{' '}
                <span className="font-bold">
                  {approvalData.req_by.real_name}
                </span>{' '}
                • {formatDate(approvalData.createdAt)}
              </p>
            </h3>

            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
            >
              <X size={18} />
            </button>
          </header>
          <div className="overflow-y-scroll max-h-[70vh] p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col items-start">
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Request ID
                </h4>
                <p className="text-sm">{approvalData._id.toString()}</p>
              </div>
              <div className="flex flex-col items-start">
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Entity ID
                </h4>
                <p className="text-sm">
                  {approvalData.object_id?.toString() || 'New Entity'}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Status
                </h4>
                <>
                  {approvalData.status === 'pending' ? (
                    <Badge
                      value={approvalData.status.toUpperCase()}
                      className={`uppercase bg-amber-600 text-white border-amber-600`}
                    />
                  ) : approvalData.status === 'approved' ? (
                    <Badge
                      value={approvalData.status.toUpperCase()}
                      className={`uppercase bg-green-600 text-white border-green-600`}
                    />
                  ) : (
                    <Badge
                      value={approvalData.status.toUpperCase()}
                      className={`uppercase bg-red-600 text-white border-red-600`}
                    />
                  )}
                </>
              </div>
              <div className="flex flex-col items-start">
                <h4 className="text-xs uppercase font-medium text-gray-500 mb-1">
                  Request Type
                </h4>
                <>
                  {isUpdate ? (
                    <Badge
                      value={`${approvalData.target_model} ${approvalData.action}`}
                      className={`uppercase bg-blue-600 text-white border-blue-600`}
                    />
                  ) : isCreate ? (
                    <Badge
                      value={`${approvalData.target_model} ${approvalData.action}`}
                      className={`uppercase bg-green-600 text-gray-900 border-green-600`}
                    />
                  ) : isDelete ? (
                    <Badge
                      value={`${approvalData.target_model} ${approvalData.action}`}
                      className={`uppercase bg-red-600 text-white border-red-600`}
                    />
                  ) : (
                    <Badge
                      value={`${approvalData.target_model} ${approvalData.action}`}
                      className={`uppercase bg-amber-600 text-white border-amber-600`}
                    />
                  )}
                </>
              </div>
            </div>

            <hr className="my-4" />

            {/* Update Request Content */}
            {isUpdate && approvalData.changes && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-medium">
                    Changes requested in {modelName}
                  </h3>
                </div>

                <div className="table-responsive text-md">
                  <table className="table table-bordered text-left text-wrap">
                    <thead>
                      <tr className="bg-gray-50 text-nowrap text-sm">
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
                        <tr key={index} className="table-light">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {change.field}
                              {/* {isArray(change.oldValue) && (
                                <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-xs">
                                  Array
                                </span>
                              )} */}
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
                                {renderArrayValue(change.newValue as any[])}
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
                    New {modelName} details
                  </h3>
                </div>

                <div className="table-responsive text-md">
                  <table className="table table-bordered text-left text-wrap">
                    <thead>
                      <tr className="bg-gray-50 text-nowrap text-sm">
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
                          <tr key={field} className="table-light">
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
                    {modelName} to be Deleted
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

                <div className="table-responsive text-md">
                  <table className="table table-bordered text-left text-wrap">
                    <thead>
                      <tr className="bg-gray-50 text-nowrap text-sm">
                        <th scope="col" className="px-6 py-3 w-1/3">
                          Field
                        </th>
                        <th scope="col" className="px-6 py-3 w-2/3">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sanitizeData(approvalData.deleted_data).map(
                        ([field, value]) => (
                          <tr key={field} className="table-light">
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
          <footer
            className={cn(
              'flex items-center px-4 py-2 border-t justify-between gap-6 border-gray-200 rounded-b',
              approvalData.status == 'pending' && 'justify-end',
            )}
          >
            {approvalData.status !== 'pending' && (
              <div className="flex flex-wrap justify-start items-center me-auto text-gray-400">
                <span>Checked by </span>
                <span className="font-semibold mx-1">
                  {approvalData.rev_by.real_name}
                </span>
                <span>on </span>
                <span className="font-semibold mx-1">
                  {formatDate(approvalData.createdAt)}
                </span>
                <span>at </span>
                <span className="font-semibold ms-1">
                  {formatTime(formatTimestamp(approvalData.createdAt!).time)}
                </span>
              </div>
            )}
            <div className="space-x-2 justify-end">
              <button
                className="rounded-md bg-gray-600 text-white hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </footer>
        </article>
      </section>
    </>
  );
};

export default ViewButton;
