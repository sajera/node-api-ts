// outsource dependencies
import { Schema, model } from 'mongoose';

const Counter = model('Counter', new Schema({
  _id: { type: String, required: true },
  value: { type: Number, default: 1 },
}));

const counters: string[] = [];

export const declare = name => {
  counters.push(name);
  return async () => {
    const { value } = await Counter.findByIdAndUpdate(name, { $inc: { value: 1 } });
    return value;
  };
};

export const initialize = async () => {
  for (const name of counters) {
    const exist = await Counter.findById(name);
    if (!exist) {
      const counter = new Counter({ _id: name });
      await counter.save();
    }
  }
};
