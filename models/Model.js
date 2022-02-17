import { Model as BaseModel } from 'vue-api-query'
import store from '../store';
import { API_HOST } from '../config/App';



export default class Model extends BaseModel {

    // Define a base url for a REST API
    baseURL () {

        if (!store.state.projects.current) {
            return 'https://' + API_HOST + '/api/v4';
        }

        // Attention!
        // We use project ID as subdomain,
        // because project slug can be changed by admin.
        let currentProjectId = store.state.projects.current.id;

        return 'https://' + currentProjectId + '.' + API_HOST + '/api/v4';

    }

    // Implement a default request method
    request (config) {
        return this.$http.request(config)
    }

    parameterNames () {
        return {
            include: 'include',
            filter: 'filter',
            sort: 'sort',
            fields: 'fields',
            append: 'append',
            page: 'page[number]',
            limit: 'page[size]'
        }
    }
}
