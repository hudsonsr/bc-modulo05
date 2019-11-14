/* eslint-disable react/sort-comp */
/* eslint-disable react/state-in-constructor */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import ApiGitHub from '../../service/ApiGitHub';

import { Form, SubmitButton, List } from './styles';
import Container from '../../components/container';

export default class Main extends Component {
   state = {
      newRepo: '',
      repositories: [],
      loading: false,
      error: false,
   };

   // carregar dados do localStorage
   componentDidMount() {
      const repositories = localStorage.getItem('repositories');

      if (repositories) {
         this.setState({
            repositories: JSON.parse(repositories),
         });
      }
   }

   // Salvar dados no localStorage
   componentDidUpdate(prevProps, prevState) {
      const { repositories } = this.state;

      if (prevState.repositories !== repositories) {
         localStorage.setItem('repositories', JSON.stringify(repositories));
      }
   }

   handleInputChange = e => {
      this.setState({ newRepo: e.target.value });
      this.setState({ error: false });
   };

   handleSubmit = async e => {
      e.preventDefault();

      try {
         const { newRepo, repositories } = this.state;

         const repoExiste = repositories.find(
            rep => rep.name.toUpperCase() === newRepo.toUpperCase()
         );

         if (repoExiste) {
            throw new Error('Repositório duplicado');
         }

         this.setState({ loading: true });

         const response = await ApiGitHub.get(`/repos/${newRepo}`);

         const data = {
            name: response.data.full_name,
         };

         this.setState({
            repositories: [...repositories, data],
            newRepo: '',
         });
      } catch (error) {
         this.setState({ error: true });
      }
      this.setState({ loading: false });
   };

   render() {
      const { newRepo, repositories, loading, error } = this.state;

      return (
         <Container>
            <h1>
               <FaGithubAlt />
               Repositórios
            </h1>
            <Form erro={error} onSubmit={this.handleSubmit}>
               <input
                  type="text"
                  placeholder="Adicionar repositório"
                  value={newRepo}
                  onChange={this.handleInputChange}
               />

               <SubmitButton loading={loading}>
                  {loading ? (
                     <FaSpinner color="#FFF" size={14} />
                  ) : (
                     <FaPlus color="#fff" size={14} />
                  )}
               </SubmitButton>
            </Form>
            <List>
               {repositories.map(repository => (
                  <li key={repository.name}>
                     <span>{repository.name}</span>
                     <Link
                        to={`/repository/${encodeURIComponent(
                           repository.name
                        )}`}
                     >
                        Detalhes
                     </Link>
                  </li>
               ))}
            </List>
         </Container>
      );
   }
}
