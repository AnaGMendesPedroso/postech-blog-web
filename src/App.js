import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';
import TeacherRoute from './shared/components/TeacherRoute';
import NotFound from './shared/components/NotFound';
import Home from './domains/posts/presentation/pages/Home';
import PostDetail from './domains/posts/presentation/pages/PostDetail';
import LoginPage from './domains/auth/presentation/pages/LoginPage';
import RegisterPage from './domains/auth/presentation/pages/RegisterPage';
import Admin from './domains/posts/presentation/pages/Admin';
import CreatePostPage from './domains/posts/presentation/pages/CreatePost';
import EditPostPage from './domains/posts/presentation/pages/EditPost';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

function App() {
  return (
    <AppWrapper>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<TeacherRoute><Admin /></TeacherRoute>} />
          <Route path="/admin/posts/new" element={<TeacherRoute><CreatePostPage /></TeacherRoute>} />
          <Route path="/admin/posts/:id/edit" element={<TeacherRoute><EditPostPage /></TeacherRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </AppWrapper>
  );
}

export default App;