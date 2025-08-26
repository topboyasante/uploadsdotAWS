import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Upload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @CreateDateColumn()
  createdAt: Date;

  // Feel Free to add more fields as necessary, per your application's requirements. A sample field is provided below.
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}
