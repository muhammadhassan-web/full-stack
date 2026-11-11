import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Person {
  @Prop({ type: String }) _id: string;
  @Prop({ required: true }) name: string;
}
export const PersonSchema = SchemaFactory.createForClass(Person);