/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Joi from 'joi';
import Hapi from 'hapi';

import { WithoutQueryAndParams } from '../types';

interface FindRequest extends WithoutQueryAndParams<Hapi.Request> {
  query: {
    per_page: number;
    page: number;
    search?: string;
    default_search_operator: 'AND' | 'OR';
    search_fields?: string[];
    sort_field?: string;
    has_reference?: {
      type: string;
      id: string;
    };
    fields?: string[];
  };
}

export const findAlertRoute = {
  method: 'GET',
  path: '/api/alert/_find',
  config: {
    tags: ['access:alerting-read'],
    validate: {
      query: Joi.object()
        .keys({
          per_page: Joi.number()
            .min(0)
            .default(20),
          page: Joi.number()
            .min(1)
            .default(1),
          search: Joi.string()
            .allow('')
            .optional(),
          default_search_operator: Joi.string()
            .valid('OR', 'AND')
            .default('OR'),
          search_fields: Joi.array()
            .items(Joi.string())
            .single(),
          sort_field: Joi.string(),
          has_reference: Joi.object()
            .keys({
              type: Joi.string().required(),
              id: Joi.string().required(),
            })
            .optional(),
          fields: Joi.array()
            .items(Joi.string())
            .single(),
        })
        .default(),
    },
  },
  async handler(request: FindRequest) {
    const { query } = request;
    const alertsClient = request.getAlertsClient!();
    return await alertsClient.find({
      options: {
        perPage: query.per_page,
        page: query.page,
        search: query.search,
        defaultSearchOperator: query.default_search_operator,
        searchFields: query.search_fields,
        sortField: query.sort_field,
        hasReference: query.has_reference,
        fields: query.fields,
      },
    });
  },
};
