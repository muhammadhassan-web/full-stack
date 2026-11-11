import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Site {
  @Prop({ required: true, unique: true, index: true }) address: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) authorId: string;
  @Prop({ required: true }) html: string;
  @Prop({ required: true }) text: string;
  @Prop({ default: () => new Date() }) createdAt: Date;
}
export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ title: 'text', text: 'text' }, { weights: { title: 5, text: 1 } });