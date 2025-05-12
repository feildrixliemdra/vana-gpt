'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useState, useEffect, MouseEvent } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Chat } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { ChatItem } from './sidebar-history-item';
import useSWRInfinite from 'swr/infinite';
import { LoaderIcon, FileIcon, MoreHorizontalIcon } from './icons';
import useSWR from 'swr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

export interface ChatHistory {
  chats: Array<Chat>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats,
  );
};

export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory,
) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

const FOLDER_DISPLAY_LIMIT = 5;

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();

  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
    fallbackData: [],
  });

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some((page) => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every((page) => page.chats.length === 0)
    : false;

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((chatHistories) => {
          if (chatHistories) {
            return chatHistories.map((chatHistory) => ({
              ...chatHistory,
              chats: chatHistory.chats.filter((chat) => chat.id !== deleteId),
            }));
          }
        });

        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  // Fetch folders
  const { data: folders, mutate: mutateFolders } = useSWR(user ? '/api/folder' : null, fetcher);
  // State for selected folder
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Helper: get chats in folders and chats not in folders
  const folderIdToChats: Record<string, Chat[]> = {};
  let chatsNotInFolders: Chat[] = [];
  if (folders && paginatedChatHistories) {
    const allChats = paginatedChatHistories.flatMap((page) => page.chats);
    allChats.forEach((chat) => {
      // @ts-ignore: Assume chat.folderId exists if assigned
      const folderId = chat.folderId;
      if (folderId) {
        if (!folderIdToChats[folderId]) folderIdToChats[folderId] = [];
        folderIdToChats[folderId].push(chat);
      } else {
        chatsNotInFolders.push(chat);
      }
    });
  }

  useEffect(() => {
    function onFolderCreated() {
      mutateFolders();
      mutate();
    }
    window.addEventListener('folder-created', onFolderCreated);
    return () => {
      window.removeEventListener('folder-created', onFolderCreated);
    };
  }, [mutateFolders, mutate]);

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      const res = await fetch('/api/folder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: folderId, name: newName }),
      });
      
      if (!res.ok) throw new Error('Failed to rename folder');
      
      await mutateFolders();
      setRenamingFolder(null);
      setNewFolderName('');
      toast.success('Folder renamed successfully');
    } catch (error) {
      toast.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    
    try {
      const res = await fetch('/api/folder', {
        method: 'DELETE',
        body: JSON.stringify({ id: deleteFolderId }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) throw new Error('Failed to delete folder');
      
      await mutateFolders();
      setShowDeleteFolderDialog(false);
      setDeleteFolderId(null);
      toast.success('Folder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        {/* Folders section */}
        {folders && folders.length > 0 && (
          <div className="flex flex-col gap-1 p-2">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Folders</div>
            {(showAllFolders ? folders : folders.slice(0, FOLDER_DISPLAY_LIMIT)).map((f: any) => (
              <div
                key={f.id}
                className={`flex flex-row items-center gap-2 px-2 py-1 rounded cursor-pointer ${selectedFolderId === f.id ? 'bg-muted' : ''}`}
                onClick={() => {
                  setSelectedFolderId(f.id);
                  router.push(`/folder/${f.id}`);
                }}
              >
                <FileIcon size={16} />
                {renamingFolder === f.id ? (
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameFolder(f.id, newFolderName);
                      } else if (e.key === 'Escape') {
                        setRenamingFolder(null);
                        setNewFolderName('');
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent border-none outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 truncate">{f.name}</span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e: MouseEvent) => e.stopPropagation()}>
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontalIcon size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        setRenamingFolder(f.id);
                        setNewFolderName(f.name);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer"
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        setDeleteFolderId(f.id);
                        setShowDeleteFolderDialog(true);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {folders.length > FOLDER_DISPLAY_LIMIT && (
              <button
                className="text-xs text-muted-foreground mt-1 px-2 text-left"
                onClick={() => setShowAllFolders((v) => !v)}
              >
                {showAllFolders ? 'Show less' : 'See more'}
              </button>
            )}
          </div>
        )}

        {/* Delete Folder Confirmation Dialog */}
        <AlertDialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Folder</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this folder? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowDeleteFolderDialog(false);
                setDeleteFolderId(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteFolder}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Chats not in folders, grouped by date as before */}
        <SidebarMenu>
          {(() => {
            const groupedChats = groupChatsByDate(chatsNotInFolders);
            return (
              <div className="flex flex-col gap-6">
                {groupedChats.today.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
                    {groupedChats.today.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                        folders={folders}
                      />
                    ))}
                  </div>
                )}
                {groupedChats.yesterday.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Yesterday</div>
                    {groupedChats.yesterday.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                        folders={folders}
                      />
                    ))}
                  </div>
                )}
                {groupedChats.lastWeek.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Last 7 days</div>
                    {groupedChats.lastWeek.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                        folders={folders}
                      />
                    ))}
                  </div>
                )}
                {groupedChats.lastMonth.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Last 30 days</div>
                    {groupedChats.lastMonth.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                        folders={folders}
                      />
                    ))}
                  </div>
                )}
                {groupedChats.older.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Older than last month</div>
                    {groupedChats.older.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                        folders={folders}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </SidebarMenu>

        <motion.div
          onViewportEnter={() => {
            if (!isValidating && !hasReachedEnd) {
              setSize((size) => size + 1);
            }
          }}
        />

        {hasReachedEnd ? (
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2 mt-8">
            You have reached the end of your chat history.
          </div>
        ) : (
          <div className="p-2 text-zinc-500 dark:text-zinc-400 flex flex-row gap-2 items-center mt-8">
            <div className="animate-spin">
              <LoaderIcon />
            </div>
            <div>Loading Chats...</div>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
