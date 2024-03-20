// outsource dependencies
import { Schema, model } from 'mongoose';

// local dependencies
import { Logger } from '../service';
import * as Counter from './counter';


// const audit = new Schema({
//   created_at: { type: Date, default: new Date() },
//   updated_at: { type: Date, default: new Date() },
// });
// const UserAudit = model('UserAudit', audit);
//
// const credential = new Schema({
//   login: { type: String, required: true },
//   password: { type: String, required: true },
// });
// const UserCredential = model('UserCredential', credential);
//
//
// const profile = new Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   // first_name: String,
//   // last_name: String,
//   // age: Number,
//   // address: String,
//   // city: String,
//   // zip: Number,
// });
// const UserProfile = model('UserProfile', profile);
const user = new Schema({
  // TODO to think about sub documents
  // audit: { type: Schema.Types.ObjectId, ref: 'UserAudit' },
  // profile: { type: Schema.Types.ObjectId, ref: 'UserProfile' },
  // credential: { type: Schema.Types.ObjectId, ref: 'UserCredential' },
  _id: Number,
  // TODO implement roles of the system
  roles: { type: Array, default: ['user'] },
  enabled: { type: Boolean, default: false },
  // NOTE profile
  name: { type: String, required: true },
  email: { type: String, required: true },
  // NOTE credential
  login: { type: String, required: true, index: true, immutable: true },
  password: { type: String, required: true },
  // NOTE audit
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});
// NOTE autoincrement
const getID = Counter.declare('user');
user.pre('save', async function (next) {
  if (!this._id) { this._id = await getID(); }
  next();
});
// NOTE update audit
user.pre('updateOne', function () {
  // TODO check/remove
  Logger.debug('updateOne', this);
  this.set({ updated_at: new Date() });
});
export const User = model('User', user);
