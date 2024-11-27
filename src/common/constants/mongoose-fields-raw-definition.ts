import mongoose from 'mongoose';
// import { AccessRights } from '../types/access-rights.types';

export const rawGeoJson = {
  type: { required: true, enum: ['Point', 'Polygon'], type: mongoose.SchemaTypes.String },
  coordinates: { required: true, type: [mongoose.SchemaTypes.Number] },
};

export const rawUserProfile = {
  address: { required: true, type: mongoose.SchemaTypes.String },

  avatar: { default: '', type: mongoose.SchemaTypes.String },

  name: { required: true, type: mongoose.SchemaTypes.String },

  phone: { required: true, type: mongoose.SchemaTypes.String },

  _id: { required: true, type: mongoose.SchemaTypes.String },

  // vkId: { required: false, type: mongoose.SchemaTypes.String },

  // role: { required: false, type: mongoose.SchemaTypes.String },

  // status: {
  //   required: false,
  //   enum: [-1, 0, 1, 2, 3],
  //   type: mongoose.SchemaTypes.Number,
  // },

  // location: rawGeoJson,

  // score: { required: false, type: mongoose.SchemaTypes.Number },

  // keys: { required: false, type: mongoose.SchemaTypes.Boolean },

  // permissions: {
  //   required: false,
  //   enum: [
  //     AccessRights.confirmUser,
  //     AccessRights.createTask,
  //     AccessRights.giveKey,
  //     AccessRights.resolveConflict,
  //     AccessRights.contentEditor,
  //     AccessRights.categoryPoints,
  //   ],
  //   type: mongoose.SchemaTypes.String,
  // },
};

export const rawCategory = {
  accessLevel: { required: true, type: mongoose.SchemaTypes.Number },
  points: { required: true, type: mongoose.SchemaTypes.Number },
  title: { required: true, type: mongoose.SchemaTypes.String },
};

export const rawAuthorProfile = {
  name: { require: true, type: mongoose.SchemaTypes.String },
  avatar: { default: '', type: mongoose.SchemaTypes.String },
  userId: { require: true, type: mongoose.SchemaTypes.String },
};
