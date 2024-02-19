import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { Repository } from "typeorm";
import { CreateVocabularyInput } from "./dto/create-vocabulary.input";
import { IndexVocabularyInput } from "./dto/index-vocabulary.input";
import { PaginationVocabularyResponse } from "./dto/pagination-vocabulary.response";
import { UpdateVocabularyInput } from "./dto/update-vocabulary.input";
import { Vocabulary } from "./entities/vocabulary.entity";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
} from "@nestjs/common";
@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private userAuthService: AuthorizationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createVocabularyInput: CreateVocabularyInput,
  ): Promise<Vocabulary> {
    const vocabulary: Vocabulary = await this.vocabularyRepository.save(
      createVocabularyInput,
    );
    return vocabulary;
  }

  async findAll(
    indexVocabularyInput?: IndexVocabularyInput,
  ): Promise<Vocabulary[]> {
    const { take, skip } = indexVocabularyInput || {};
    return await this.vocabularyRepository.find({
      skip,
      take,
      order: { sort: "ASC" },
    });
  }

  async paginate(
    indexVocabularyInput?: IndexVocabularyInput,
  ): Promise<PaginationVocabularyResponse> {
    indexVocabularyInput.boot();
    const { take, skip } = indexVocabularyInput || {};
    const [data, total] = await Vocabulary.findAndCount({
      skip,
      take,
      order: { sort: "ASC" },
    });


    return PaginationVocabularyResponse.make(indexVocabularyInput, total, data);
  }

  async findOne(id: number, slug?: string, user?: User): Promise<Vocabulary> {

    const vocabulary = await this.vocabularyRepository.findOneBy({ id, slug });
  
    if (!vocabulary) {
      throw new NotFoundException();
    }
    delete vocabulary.createdAt;
    delete vocabulary.updatedAt;
    return vocabulary;
  }

  async update(
    id: number,
    updateVocabularyInput: UpdateVocabularyInput,
  ): Promise<Vocabulary> {
    const vocabulary: Vocabulary = await this.vocabularyRepository.preload({
      id,
      ...updateVocabularyInput,
    });
    if (!vocabulary) {
      throw new NotFoundException();
    }
    await this.vocabularyRepository.save(vocabulary);
    return vocabulary;
  }

  async remove(id: number): Promise<Vocabulary> {
    const vocabulary: Vocabulary = await this.findOne(id);
    await this.vocabularyRepository.remove(vocabulary);
    vocabulary.id = id;
    return vocabulary;
  }
}
