// src/modules/groupInfo/tabs/FilesContent.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  transformFiles, 
  formatFileSize,
  formatFileDate
} from '@shared/lib/fileUtils'
import type { BackendFile, BaseFile, MockFile } from '@shared/types/file'
import FileItem from '@shared/ui/FileItem'
import { useSearch } from '@shared/hooks/useSearch'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import { loadGroupFiles, initGroupFiles } from '@shared/lib/localStorageGroupFiles'

// Моковые файлы по умолчанию (те же, что были)
const DEFAULT_MOCK_FILES: MockFile[] = [
  { url: '/mockFiles/_Info.txt' },
  { url: '/mockFiles/задача для deepseek.docx' },
  { url: '/mockFiles/CLI-COMMANDS.md' },
  { url: '/mockFiles/COMMIT-STRUCTURE.md' },
  { url: '/mockFiles/CSS-STYLING-GUIDE-DETAILED.md' },
  { url: '/mockFiles/GIT-FLOW.md' },
  { url: '/mockFiles/lorem.pdf' },
  { url: '/mockFiles/README.ru.md' },
]

interface FilesContentProps {
  chatUid: string // добавляем пропс
}

export default function FilesContent({ chatUid }: FilesContentProps) {
  const [visible, setVisible] = useState(false)
  const [filesState, setFilesState] = useState<BaseFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  
  const downloadIntervalsRef = useRef<{[key: number]: NodeJS.Timeout}>({})
  
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    loadFiles()
    return () => {
      clearTimeout(t)
      Object.values(downloadIntervalsRef.current).forEach(interval => {
        clearInterval(interval)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUid]) // перезагружаем при смене чата

  // Функция загрузки файлов из localStorage
  const loadFiles = async () => {
    setLoading(true)
    try {
      // Пытаемся загрузить из localStorage
      let filesData = loadGroupFiles(chatUid)
      if (!filesData) {
        // Если нет, инициализируем моковыми данными
        filesData = initGroupFiles(chatUid, DEFAULT_MOCK_FILES)
      }
      const transformedFiles = transformFiles(filesData.results, 'mock')
      setFilesState(transformedFiles)
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error)
      // В случае ошибки используем моковые данные напрямую
      const transformedFiles = transformFiles(DEFAULT_MOCK_FILES, 'mock')
      setFilesState(transformedFiles)
    } finally {
      setLoading(false)
    }
  }
  
  // Фильтрация файлов по имени с помощью хука useSearch
  const { filteredValue: filteredFiles } = useSearch(
    filesState,
    searchValue,
    [(file) => file.name.toLowerCase()]
  )
  
  // Функция для имитации загрузки файла
  const simulateDownload = (id: number) => {
    const file = filesState.find(f => f.id === id);
    if (!file) return;
    
    // Если файл уже загружается - останавливаем загрузку
    if (file.isLoading) {
      if (downloadIntervalsRef.current[id]) {
        clearInterval(downloadIntervalsRef.current[id]);
        delete downloadIntervalsRef.current[id];
      }
      setFilesState(prev => 
        prev.map(f => 
          f.id === id 
            ? { 
                ...f, 
                isLoading: false, 
                progress: 0,
                size: `${f.originalSize.toFixed(1)} MB`
              } 
            : f
        )
      );
      return;
    }
    
    // Начинаем загрузку
    setFilesState(prev => 
      prev.map(f => 
        f.id === id 
          ? { ...f, isLoading: true, progress: 1 } 
          : f
      )
    );
    
    let progress = 1;
    const interval = setInterval(() => {
      progress += 1;
      setFilesState(prev => 
        prev.map(f => {
          if (f.id === id) {
            const remaining = file.originalSize * (1 - progress / 100);
            return {
              ...f,
              progress,
              size: remaining > 0 ? `${remaining.toFixed(1)} MB` : '0 MB'
            };
          }
          return f;
        })
      );
      
      if (progress >= 100) {
        clearInterval(interval);
        delete downloadIntervalsRef.current[id];
        setTimeout(() => {
          setFilesState(prev => 
            prev.map(f => 
              f.id === id 
                ? { 
                    ...f, 
                    isLoading: false, 
                    progress: 0,
                    size: `${file.originalSize.toFixed(1)} MB`
                  } 
                : f
            )
          );
        }, 500);
      }
    }, 50);
    
    downloadIntervalsRef.current[id] = interval;
  }

  // Вычисляем общий размер файлов
  const totalSize = filesState.reduce((sum, file) => {
    return sum + file.originalSize;
  }, 0).toFixed(1) + ' MB';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-text-gray">Загрузка файлов...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Поле поиска (аналогично ContactsListGroup) */}
      <div className="mt-2 flex h-1/12 items-center px-4">
        <Search
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Поиск"
          clearIconSrc="/images/search/iconsClose.svg"
          showClearButton={true}
          bgColor="bg-accent-violet-ultra-light"
        />
      </div>
      
      <div className="space-y-0">
        {filesState.length === 0 ? (
          <div className="p-8 text-center text-text-gray">
            Файлы не найдены
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8">
            <EmptySearchState />
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileItem 
              key={file.id}
              file={file}
              onDownload={simulateDownload}
            />
          ))
        )}
      </div>
    </div>
  );
}