import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import PostApiRepository from '../../infrastructure/repositories/PostApiRepository';
import ListPosts from '../../application/usecases/ListPosts';
import DeletePost from '../../application/usecases/DeletePost';
import Loading from '../../../../shared/components/Loading';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import Pagination from '../../../../shared/components/Pagination';

const Container = styled.main`
  max-width: ${({ theme }) => theme.breakpoints.desktop};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.text};
`;

const NewPostButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Thead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TitleCell = styled.span`
  display: block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  text-transform: lowercase;
  background-color: ${({ $status }) => ($status === 'published' ? '#DCFCE7' : '#F1F5F9')};
  color: ${({ $status }) => ($status === 'published' ? '#166534' : '#475569')};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ $variant, theme }) => ($variant === 'danger' ? theme.colors.error : theme.colors.primary)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $variant }) => ($variant === 'danger' ? '#FEF2F2' : '#EFF6FF')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

// Mobile cards
const CardList = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

// Dialog
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const DialogTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const DialogText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const DialogActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const DialogButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ $variant, theme }) => ($variant === 'danger' ? theme.colors.error : theme.colors.border)};
  background-color: ${({ $variant, theme }) => ($variant === 'danger' ? theme.colors.error : theme.colors.surface)};
  color: ${({ $variant, theme }) => ($variant === 'danger' ? theme.colors.surface : theme.colors.text)};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteErrorMessage = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: #FEF2F2;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

function Admin() {
  const navigate = useNavigate();

  const repository = useMemo(() => new PostApiRepository(), []);
  const listPostsUseCase = useMemo(() => new ListPosts(repository), [repository]);
  const deletePostUseCase = useMemo(() => new DeletePost(repository), [repository]);

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadPosts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await listPostsUseCase.execute({ page, limit: 10, status: 'all' });
      setPosts(result.data);
      setPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        total: result.pagination.total,
      });
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [listPostsUseCase]);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const handlePageChange = (newPage) => {
    loadPosts(newPage);
  };

  const handleDeleteClick = (id) => {
    setPostToDelete(id);
    setShowDialog(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deletePostUseCase.execute({ id: postToDelete });
      setShowDialog(false);
      setPostToDelete(null);

      // Refetch current page
      const result = await listPostsUseCase.execute({ page: pagination.page, limit: 10, status: 'all' });

      // If page is empty and not first page, go back one page
      if (result.data.length === 0 && pagination.page > 1) {
        loadPosts(pagination.page - 1);
      } else {
        setPosts(result.data);
        setPagination({
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total,
        });
      }
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDialog(false);
    setPostToDelete(null);
    setDeleteError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancelDelete();
    }
  };

  return (
    <Container data-testid="admin-page">
      <Header>
        <Title data-testid="admin-title">Painel Administrativo</Title>
        <NewPostButton
          data-testid="admin-btn-new-post"
          onClick={() => navigate('/admin/posts/new')}
        >
          <FiPlus /> Novo Post
        </NewPostButton>
      </Header>

      {loading && <Loading text="Carregando posts..." />}

      {error && !loading && <ErrorMessage message={error} />}

      {!loading && !error && posts.length === 0 && (
        <EmptyMessage data-testid="admin-empty-message">
          Nenhum post encontrado
        </EmptyMessage>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <Table data-testid="admin-table">
            <Thead>
              <tr>
                <Th>Título</Th>
                <Th>Autor</Th>
                <Th>Status</Th>
                <Th>Data</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} data-testid={`admin-row-${post.id}`}>
                  <Td>
                    <TitleCell title={post.titulo}>{post.titulo}</TitleCell>
                  </Td>
                  <Td>{post.autor}</Td>
                  <Td>
                    <Badge $status={post.status}>{post.status}</Badge>
                  </Td>
                  <Td>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</Td>
                  <Td>
                    <ActionsCell>
                      <IconButton
                        data-testid={`admin-btn-edit-${post.id}`}
                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        aria-label={`Editar ${post.titulo}`}
                      >
                        <FiEdit2 size={14} />
                      </IconButton>
                      <IconButton
                        data-testid={`admin-btn-delete-${post.id}`}
                        $variant="danger"
                        onClick={() => handleDeleteClick(post.id)}
                        disabled={deleting}
                        aria-label={`Excluir ${post.titulo}`}
                      >
                        <FiTrash2 size={14} />
                      </IconButton>
                    </ActionsCell>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <CardList aria-hidden="true">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardTitle title={post.titulo}>{post.titulo}</CardTitle>
                <CardMeta>
                  <span>{post.autor}</span>
                  <Badge $status={post.status}>{post.status}</Badge>
                  <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                </CardMeta>
                <CardActions>
                  <IconButton
                    onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                    aria-label={`Editar ${post.titulo}`}
                  >
                    <FiEdit2 size={14} />
                  </IconButton>
                  <IconButton
                    $variant="danger"
                    onClick={() => handleDeleteClick(post.id)}
                    disabled={deleting}
                    aria-label={`Excluir ${post.titulo}`}
                  >
                    <FiTrash2 size={14} />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </CardList>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {showDialog && (
        <Overlay onClick={handleCancelDelete} onKeyDown={handleKeyDown}>
          <Dialog
            data-testid="admin-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle id="dialog-title">Confirmar Exclusão</DialogTitle>
            <DialogText>Tem certeza que deseja excluir este post?</DialogText>

            {deleteError && (
              <DeleteErrorMessage data-testid="admin-delete-error">
                {deleteError}
              </DeleteErrorMessage>
            )}

            <DialogActions>
              <DialogButton
                data-testid="admin-btn-confirm-no"
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancelar
              </DialogButton>
              <DialogButton
                data-testid="admin-btn-confirm-yes"
                $variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Confirmar'}
              </DialogButton>
            </DialogActions>
          </Dialog>
        </Overlay>
      )}
    </Container>
  );
}

export default Admin;
