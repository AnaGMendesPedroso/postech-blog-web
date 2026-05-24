import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { truncateText } from '../../../../shared/utils/truncateText';
import { formatDate } from '../../../../shared/utils/formatDate';

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const Card = styled.article`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  line-height: 1.3;
`;

const Excerpt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const Author = styled.span`
  font-weight: 500;
`;

const DateEl = styled.time`
  color: ${({ theme }) => theme.colors.textLight};
`;

function PostCard({ id, titulo, conteudo, autor, createdAt }) {
  return (
    <CardLink to={`/posts/${id}`}>
      <Card data-testid={`post-card-${id}`}>
        <Title data-testid={`post-card-title-${id}`}>{titulo}</Title>
        <Excerpt data-testid={`post-card-excerpt-${id}`}>
          {truncateText(conteudo, 150)}
        </Excerpt>
        <Meta>
          <Author data-testid={`post-card-author-${id}`}>{autor}</Author>
          <DateEl data-testid={`post-card-date-${id}`} dateTime={createdAt}>
            {formatDate(createdAt)}
          </DateEl>
        </Meta>
      </Card>
    </CardLink>
  );
}

export default PostCard;
