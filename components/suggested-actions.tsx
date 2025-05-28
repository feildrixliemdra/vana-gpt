'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useEffect, useState } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const defaultActions = [
    {
      title: 'What are the advantages',
      label: 'of using Next.js?',
      action: 'What are the advantages of using Next.js?',
    },
    {
      title: 'Write code to',
      label: `demonstrate djikstra's algorithm`,
      action: `Write code to demonstrate djikstra's algorithm`,
    },
    {
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
    },
    {
      title: 'What is the weather',
      label: 'in San Francisco?',
      action: 'What is the weather in San Francisco?',
    },
  ];

  const [suggestedActions, setSuggestedActions] = useState<any[]>(defaultActions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAction, setEditAction] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', action: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchActions() {
      try {
        const res = await fetch('/api/user-suggested-actions');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSuggestedActions(data);
          } else {
            setSuggestedActions(defaultActions);
          }
        } else {
          setSuggestedActions(defaultActions);
        }
      } catch {
        setSuggestedActions(defaultActions);
      } finally {
        setLoading(false);
      }
    }
    fetchActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (action: any | null = null) => {
    setEditAction(action);
    setForm(
      action
        ? { title: action.title, action: action.action }
        : { title: '', action: '' },
    );
    setModalOpen(true);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let res;
      if (editAction && editAction.id) {
        res = await fetch('/api/user-suggested-actions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editAction.id, ...form }),
        });
      } else {
        res = await fetch('/api/user-suggested-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (res.ok) {
        const actionsRes = await fetch('/api/user-suggested-actions');
        const data = await actionsRes.json();
        setSuggestedActions(Array.isArray(data) && data.length > 0 ? data : defaultActions);
        setModalOpen(false);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save action');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/user-suggested-actions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const actionsRes = await fetch('/api/user-suggested-actions');
        const data = await actionsRes.json();
        setSuggestedActions(Array.isArray(data) && data.length > 0 ? data : defaultActions);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete action');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to delete action');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const isUserActions = suggestedActions.length > 0 && suggestedActions[0].id;
  const canAdd = isUserActions ? suggestedActions.length < 6 : false;

  // Custom handler for AlertDialog open state
  const handleModalOpenChange = (open: boolean) => {
    if (!open) setModalOpen(false);
    // Never setModalOpen(true) from here, only from openModal()
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-base">Suggested Actions</span>
        {isUserActions && canAdd && (
          <Button size="sm" type="button" onClick={() => openModal(null)}>
            + Add
          </Button>
        )}
      </div>
      <div
        data-testid="suggested-actions"
        className="grid sm:grid-cols-2 gap-2 w-full"
      >
        {suggestedActions.map((suggestedAction, index) => (
          <Card
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className="relative flex flex-col justify-between cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={isUserActions || !isUserActions ? async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);
              append({
                role: 'user',
                content: suggestedAction.action,
              });
            } : undefined}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-medium block">{suggestedAction.title}</span>
                  <span className="text-muted-foreground block text-xs mb-2">
                    {suggestedAction.action}
                  </span>
                </div>
                {isUserActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="ml-2" onClick={e => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        &#x22EE;
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); openModal(suggestedAction); }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(suggestedAction.id); }}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <AlertDialog open={modalOpen} onOpenChange={handleModalOpenChange}>
        <AlertDialogContent>
          <form onSubmit={handleSubmit}>
            <AlertDialogHeader>
              <AlertDialogTitle>{editAction ? 'Edit' : 'Add'} Suggested Action</AlertDialogTitle>
              <AlertDialogDescription>
                {editAction ? 'Update your suggested action.' : 'Create a new suggested action.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
                required
              />
              <Textarea
                name="action"
                placeholder="Prompt"
                value={form.action}
                onChange={handleChange}
                maxLength={1000}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={submitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editAction ? 'Update' : 'Add'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
