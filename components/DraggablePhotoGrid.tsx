'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, GripVertical, Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggablePhotoGridProps {
  photos: string[]
  onPhotosChange?: (newPhotos: string[]) => void
  onAddPhoto?: () => void
  onPhotoClick?: (index: number) => void
  onUploadPhoto?: (file: File) => Promise<void>
  isUploading?: boolean
  maxPhotos?: number
  showDragHandles?: boolean
  showDeleteButtons?: boolean
}

interface SortablePhotoItemProps {
  photo: string
  index: number
  onDelete?: (index: number) => void
  onPhotoClick?: (index: number) => void
  showDragHandles?: boolean
  showDeleteButtons?: boolean
}

function SortablePhotoItem({ 
  photo, 
  index, 
  onDelete, 
  onPhotoClick,
  showDragHandles = true,
  showDeleteButtons = true 
}: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
      onClick={() => onPhotoClick?.(index)}
    >
      <Image
        src={photo}
        alt={`照片 ${index + 1}`}
        width={200}
        height={200}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log(`照片 ${index + 1} 加载失败:`, photo)
          const target = e.currentTarget as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      
      {/* 拖拽手柄 */}
      {showDragHandles && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* 删除按钮 */}
      {showDeleteButtons && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(index)
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
      
      {/* 照片编号 */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  )
}

export default function DraggablePhotoGrid({ 
  photos, 
  onPhotosChange, 
  onAddPhoto,
  onPhotoClick,
  onUploadPhoto,
  isUploading = false,
  maxPhotos = 6,
  showDragHandles = true,
  showDeleteButtons = true
}: DraggablePhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && onPhotosChange) {
      const oldIndex = photos.indexOf(active.id as string)
      const newIndex = photos.indexOf(over?.id as string)
      
      const newPhotos = arrayMove(photos, oldIndex, newIndex)
      onPhotosChange(newPhotos)
    }
  }

  const handleDeletePhoto = (index: number) => {
    if (confirm('确定要删除这张照片吗？') && onPhotosChange) {
      const newPhotos = photos.filter((_, i) => i !== index)
      onPhotosChange(newPhotos)
    }
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <SortablePhotoItem
                key={photo}
                photo={photo}
                index={index}
                onDelete={onPhotosChange ? handleDeletePhoto : undefined}
                onPhotoClick={onPhotoClick}
                showDragHandles={showDragHandles}
                showDeleteButtons={showDeleteButtons}
              />
            ))}
            
            {/* 添加照片按钮 */}
            {photos.length < maxPhotos && onAddPhoto && (
              <div
                className="relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                onClick={onAddPhoto}
              >
                <div className="text-center">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                  ) : (
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-gray-500">
                    {isUploading ? '上传中...' : '添加照片'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* 使用说明 */}
      {showDragHandles && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="mb-1">💡 使用提示：</p>
          <ul className="space-y-1">
            <li>• 拖拽照片可以调整顺序</li>
            <li>• 悬停照片显示删除按钮</li>
            <li>• 点击&quot;添加照片&quot;上传新照片</li>
          </ul>
        </div>
      )}
    </div>
  )
} 