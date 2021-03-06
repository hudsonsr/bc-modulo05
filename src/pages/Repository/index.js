/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

import ApiGitHub from '../../service/ApiGitHub';

import { Loading, Owner, IssueList, Pagination } from './styles';
import Container from '../../components/container';

// import { Container } from './styles';

class Repository extends Component {
   static propTypes = {
      match: PropTypes.shape({
         params: PropTypes.shape({
            repository: PropTypes.string,
         }),
      }).isRequired,
   };

   state = {
      repository: {},
      issues: [],
      loading: true,
      issueState: 'all',
      page: 1,
   };

   async componentDidMount() {
      const { match } = this.props;

      const { issueState } = this.state;
      const repoName = decodeURIComponent(match.params.repository);

      const [repository, issues] = await Promise.all([
         ApiGitHub.get(`repos/${repoName}`),
         ApiGitHub.get(`repos/${repoName}/issues`, {
            params: {
               state: issueState,
               per_page: 5,
            },
         }),
      ]);

      this.setState({
         repository: repository.data,
         issues: issues.data,
         loading: false,
      });
   }

   loadIssues = async () => {
      const { issueState, page } = this.state;
      const { match } = this.props;

      const repoName = decodeURIComponent(match.params.repository);
      const issues = await ApiGitHub.get(
         `repos/${decodeURIComponent(repoName)}/issues`,
         {
            params: {
               state: issueState,
               per_page: 5,
               page,
            },
         }
      );

      this.setState({
         issues: issues.data,
         loading: false,
      });
   };

   handleChange = async e => {
      await this.setState({
         issueState: e.target.value,
         loading: true,
         page: 1,
      });
      this.loadIssues();
   };

   handleChangePage = async action => {
      const { page } = this.state;
      await this.setState({
         page: action === 'next' ? page + 1 : page - 1,
         loading: true,
      });

      this.loadIssues();
   };

   render() {
      const { repository, issues, loading, issueState, page } = this.state;

      if (loading) {
         return <Loading>Carregando</Loading>;
      }

      return (
         <Container>
            <Owner>
               <Link to="/">Voltar aos repositórios</Link>
               <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
               />
               <h1>{repository.name}</h1>
               <p>{repository.description}</p>
            </Owner>

            <IssueList>
               <select value={issueState} onChange={this.handleChange}>
                  <option value="all">Todos</option>
                  <option value="open">Abertos</option>
                  <option value="closed">Fechados</option>
               </select>
               {issues.map(issue => (
                  <li key={String(issue.id)}>
                     <img src={issue.user.avatar_url} alt={issue.user.login} />
                     <div>
                        <strong>
                           <a href={issue.html_url}>{issue.title}</a>
                           {issue.labels.map(label => (
                              <span key={String(label.id)}>{label.name}</span>
                           ))}
                        </strong>
                        <p>{issue.user.login}</p>
                     </div>
                  </li>
               ))}
            </IssueList>
            <Pagination>
               <button
                  type="button"
                  disabled={page < 2}
                  onClick={() => this.handleChangePage('prev')}
               >
                  <FaAngleDoubleLeft color="#000" size={14} />
               </button>
               <button
                  type="button"
                  onClick={() => this.handleChangePage('next')}
               >
                  <FaAngleDoubleRight color="#000" size={14} />
               </button>
            </Pagination>
         </Container>
      );
   }
}

export default Repository;
