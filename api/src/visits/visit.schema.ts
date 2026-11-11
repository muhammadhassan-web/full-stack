import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Visit {
  @Prop({ required: true, unique: true }) visitId: string;
  @Prop({ required: true, index: true }) personId: string;
  @Prop({ required: true }) address: string;
  @Prop({ required: true }) at: Date;
  @Prop({ required: true }) via: string; // typed | link | back | forward | history | search
  @Prop({ required: true }) found: boolean;
}
export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ personId: 1, at: -1 });